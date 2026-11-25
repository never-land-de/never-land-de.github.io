// Optional real-browser QA. No npm packages: Node 22+ and installed Chrome.
// Start the static server first; run: node tests/station_browser.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const origin = process.env.STATION_TEST_ORIGIN || 'http://127.0.0.1:8000';
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const artifacts = await mkdtemp(join(tmpdir(), 'station-browser-'));
const port = 9347;
const processHandle = spawn(chrome, ['--headless', '--disable-gpu', '--no-first-run', '--disable-background-networking', '--disable-sync', '--password-store=basic', '--use-mock-keychain', `--remote-debugging-port=${port}`, `--user-data-dir=${artifacts}/profile`, 'about:blank'], { stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
const checks = [];
const errors = [];
const requests = [];
let nextId = 0;
const pending = new Map();
function call(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { pending.delete(id); reject(Error(`Timed out: ${method}`)); }, 15000);
        pending.set(id, { resolve, reject, timeout });
        socket.send(JSON.stringify({ id, method, params }));
    });
}
async function evaluate(expression) {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function until(expression) {
    for (let i = 0; i < 100; i++) {
        if (await evaluate(expression)) return;
        await delay(50);
    }
    throw Error(`Condition did not become true: ${expression}`);
}
async function navigate(path = '/station/index.html') {
    await call('Page.navigate', { url: origin + path });
    await until(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete'`);
    if (path.includes('/station/')) await until("document.getElementById('command')?.disabled === false");
}
async function submit(value) {
    await ready();
    await evaluate(`document.getElementById('command').value = ${JSON.stringify(value)}; document.getElementById('command').focus();`);
    await key('Enter');
    await ready();
}
const ready = () => until("location.pathname !== '/station/index.html' || document.getElementById('command')?.disabled === false");
async function traceAction(action) {
    await ready();
    await evaluate(`(()=>{
        window.stationRenderTrace=[];
        const sample=()=>stationRenderTrace.push({text:document.getElementById('output').textContent,disabled:document.getElementById('command').disabled,run:document.getElementById('run-command').disabled,busy:document.getElementById('transcript').getAttribute('aria-busy'),y:document.getElementById('command').getBoundingClientRect().y,scroll:document.getElementById('transcript').scrollTop,time:performance.now()});
        ${action};
        sample();
        const step=()=>{sample();if(document.getElementById('command').disabled)requestAnimationFrame(step)};
        requestAnimationFrame(step);
    })()`);
}
async function traceCommand(value) {
    await traceAction(`document.getElementById('command').value=${JSON.stringify(value)};document.getElementById('command-form').requestSubmit()`);
}
async function assertTyped() {
    await ready(); await delay(30);
    const trace = await evaluate('window.stationRenderTrace');
    const final = await output();
    assert.equal(trace[0].text, '', 'Clear before the first frame');
    assert.ok(trace.some(sample => sample.text.length > 0 && sample.text !== final), 'Visible partial output');
    assert.ok(trace.filter(sample => sample.text !== final).every(sample => sample.disabled && sample.run && sample.busy === 'true'));
    assert.ok(trace.every(sample => sample.y === trace[0].y && sample.scroll === 0), 'No layout or scroll jitter');
    assert.equal(await evaluate('document.activeElement.id'), 'command');
    assert.equal(await evaluate("document.querySelector('#output .output-writing')"), null);
    assert.ok(trace.at(-1).time - trace[0].time < 1800, 'Brisk output');
    return final;
}
async function key(key, modifiers = 0) {
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, modifiers, text: key === 'Enter' ? '\r' : undefined, windowsVirtualKeyCode: { Enter: 13, Escape: 27, Tab: 9, ArrowUp: 38, ArrowDown: 40, PageUp: 33, PageDown: 34 }[key] });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, modifiers });
}
const output = () => evaluate("document.getElementById('output').textContent");
async function check(name, fn) { await fn(); checks.push(name); console.log(`PASS ${name}`); }
async function allPages(selector = '.output-line') {
    await ready();
    while (await evaluate("!document.getElementById('previous-page').disabled")) {
        await evaluate("document.getElementById('previous-page').click()"); await ready();
    }
    const texts = [];
    for (let i = 0; i < 1000; i++) {
        texts.push(...await evaluate(`Array.from(document.querySelectorAll('#output ${selector}'), e => e.textContent)`));
        const fits = await evaluate("document.getElementById('transcript').scrollHeight <= document.getElementById('transcript').clientHeight + 1");
        assert.equal(fits, true, 'Each page fits the console');
        if (await evaluate("document.getElementById('next-page').disabled")) return texts;
        await evaluate("document.getElementById('next-page').click()");
        await ready();
    }
    throw Error('Pagination did not terminate');
}

try {
    let tabs;
    for (let i = 0; i < 100; i++) {
        try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await delay(100); }
    }
    if (!tabs) throw Error('Chrome did not start.');
    socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    socket.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.id && pending.has(message.id)) {
            const request = pending.get(message.id);
            pending.delete(message.id);
            clearTimeout(request.timeout);
            if (message.error) request.reject(Error(JSON.stringify(message.error))); else request.resolve(message.result);
        }
        if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
        if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
        if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errors.push(message.params.response);
        if (message.method === 'Network.loadingFailed') errors.push(message.params);
    };
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Network.enable');
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await navigate();

    await check('clear is painted before typing; controls lock, rapid resubmits are ignored and focus returns', async () => {
        await traceAction("document.getElementById('command').value='whoami';document.getElementById('command-form').requestSubmit();for(let i=0;i<8;i++){document.getElementById('command').value='wake';document.getElementById('command-form').requestSubmit();document.getElementById('run-command').click()}document.getElementById('command').value=''");
        await key('Enter'); await key('Enter');
        assert.equal(await assertTyped(), '> whoamiOPERATOR 07STATUS: REPLACEABLE');
        assert.equal(await evaluate("sessionStorage.getItem('project-tomorrow:story:v1')"), null);
        await key('ArrowUp');
        assert.equal(await evaluate("document.getElementById('command').value"), 'whoami');
        await submit('clear');
        assert.equal(await output(), '');
        assert.equal(await evaluate("document.getElementById('announcement').textContent"), '');
    });
    await evaluate("sessionStorage.removeItem('project-tomorrow:story:v1')");
    await navigate();

    await check('boot, public help, locked archive and no early identity disclosure', async () => {
        assert.match(await output(), /N\.E\.V\.E\.R\.-77 SYSTEM/);
        assert.ok(!(await output()).includes('P.A.N.I.C.'));
        await submit('help');
        const help = await output();
        assert.ok(help.includes('interpreter'));
        assert.ok(!help.includes('panic'));
        await submit('panic');
        assert.ok((await output()).endsWith('INVALID INPUT'));
        await submit('execute the-final-operator');
        assert.ok((await output()).endsWith('ACCESS DENIED'));
        assert.equal(await evaluate("sessionStorage.getItem('project-tomorrow:story:v1')"), null);
    });

    await check('inline quoted log reader preserves input and observing transition', async () => {
        await submit('execute "Bartmoss Manifest"');
        assert.equal(await evaluate("document.querySelector('dialog[open]')"), null);
        assert.equal(await evaluate("sessionStorage.getItem('project-tomorrow:story:v1')"), 'observing');
        assert.match(await output(), /ARCHIVE FRAGMENT MISSING/);
        assert.equal(await evaluate('document.activeElement.id'), 'command');
        await submit('status');
        assert.match(await output(), /UNREGISTERED PROCESS/);
        assert.ok(!(await output()).includes('P.A.N.I.C.'));
    });

    await check('independent commands replace previous output at the top; RUN and clear obey the same rule', async () => {
        for (const value of ['help', 'list', 'status', 'whoami', 'xyzzy', 'unknown-command', 'execute missing', 'execute cynesure-prototypes', 'reboot']) {
            await submit(value);
            const echoes = await evaluate("Array.from(document.querySelectorAll('#output .command-echo'), e => e.textContent)");
            assert.deepEqual(echoes, [`> ${value}`]);
            assert.equal(await evaluate("document.getElementById('transcript').scrollTop"), 0);
        }
        await evaluate("document.getElementById('command').value='whoami';document.getElementById('run-command').click()");
        await ready();
        assert.ok((await output()).startsWith('> whoami'));
        assert.ok(!(await output()).includes('BUILD 1970'));
        await submit('clear'); await delay(100);
        assert.equal(await output(), '');
        assert.equal(await evaluate("document.getElementById('announcement').textContent"), '');
        assert.equal(await evaluate("document.getElementById('output-pages').hidden"), true);
    });

    await check('arrow history preserves typed draft; clear keeps story state', async () => {
        await submit('status');
        await evaluate("document.getElementById('command').value='unfinished'; document.getElementById('command').focus()");
        await key('ArrowUp');
        assert.equal(await evaluate("document.getElementById('command').value"), 'status');
        await key('ArrowDown');
        assert.equal(await evaluate("document.getElementById('command').value"), 'unfinished');
        await submit('clear');
        assert.equal(await output(), '');
        assert.equal(await evaluate("sessionStorage.getItem('project-tomorrow:story:v1')"), 'observing');
    });

    await check('exit Y/N mode rejects commands, Y gag leaves real return link available', async () => {
        await submit('exit');
        await submit('contact');
        assert.equal(await evaluate('location.pathname'), '/station/index.html');
        assert.ok((await output()).endsWith('DO YOU WANT TO SHUT DOWN THE SYSTEM? Y/N'));
        await submit('Y');
        assert.ok((await output()).endsWith("I'M SORRY. THAT'S NOT WHAT HAPPENED."));
        assert.ok((await output()).startsWith('> Y'));
        assert.equal(await evaluate("!!document.querySelector('.return-link[href=\"../tech/index.html\"]')"), true);
        await submit('exit'); await submit('N');
        assert.ok((await output()).endsWith('SHUTDOWN CANCELLED.'));
        assert.ok(!(await output()).includes("I'M SORRY."));
    });

    await check('interpreter back and Escape, exact sequence, final log and reboot persistence', async () => {
        await submit('interpreter'); await submit('who are you');
        assert.ok(!(await output()).includes('P.A.N.I.C.'));
        assert.ok(!(await output()).includes('> interpreter'));
        assert.ok((await output()).includes('> who are you'));
        await submit('back');
        assert.equal(await evaluate("document.getElementById('mode-label').textContent"), 'COMMAND MODE');
        await submit('interpreter'); await key('Escape');
        await submit('4  8 15 16 23 42');
        assert.equal(await evaluate("sessionStorage.getItem('project-tomorrow:story:v1')"), 'awakened');
        await submit('status'); assert.match(await output(), /PROCESS ID: P\.A\.N\.I\.C\./);
        await submit('execute the-final-operator');
        assert.equal(await evaluate("document.querySelector('#output .log-text').textContent"), 'SUBJECT IDENTIFIED.\nPLEASE DO NOT TURN AROUND.');
        await submit('panic');
        assert.equal(await evaluate("document.getElementById('mode-label').textContent"), 'INTERPRETER / SIMULATED');
        await key('Escape'); await submit('reboot');
        assert.match(await output(), /P\.A\.N\.I\.C\.: STILL HERE/);
        await navigate(); await submit('status');
        assert.match(await output(), /PROCESS ID: P\.A\.N\.I\.C\./);
    });

    await check('diagnostics, exit and both dialogue modes type each new screen before re-enabling input', async () => {
        for (const value of ['help', 'status', 'whoami', 'date', 'version', 'list', 'execute station-orientation', 'exit', 'y', 'interpreter', 'who are you', 'back', 'panic', 'hello', 'back']) {
            await traceCommand(value);
            const text = await assertTyped();
            assert.ok(text.startsWith(`> ${value}`));
            assert.equal(await evaluate("document.querySelectorAll('#output .command-echo').length"), 1);
        }
    });

    await check('resize and Escape cancel stale animation safely and leave one completed screen', async () => {
        await traceCommand('help');
        await delay(140);
        await call('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
        await ready();
        assert.ok((await output()).endsWith('version'));
        assert.equal(await evaluate("document.querySelectorAll('#output .command-echo').length"), 1);
        await traceCommand('interpreter');
        await delay(100);
        await key('Escape'); await ready();
        assert.equal(await output(), 'TERMINAL CONTROL RESTORED.');
        await submit('whoami');
        const stable = await output();
        await delay(900);
        assert.equal(await output(), stable);
        assert.equal(await evaluate('document.activeElement.id'), 'command');
    });

    await check('command and composer XSS remain literal text; local preview sends no requests', async () => {
        const payload = '<img src=x onerror="window.stationInjected=1">';
        await submit(payload);
        assert.equal(await evaluate("document.querySelector('#output img')"), null);
        await submit('message');
        const before = requests.length;
        await evaluate(`document.getElementById('call-sign').value=${JSON.stringify(payload)};document.getElementById('message-text').value=${JSON.stringify(payload)};document.getElementById('message-form').requestSubmit()`);
        assert.equal(await evaluate("document.getElementById('preview-text').textContent"), payload);
        assert.equal(await evaluate("document.querySelector('#message-preview img')"), null);
        assert.equal(await evaluate('window.stationInjected'), undefined);
        assert.equal(requests.length, before);
        assert.match(await evaluate("document.getElementById('message-preview').textContent"), /LOCAL ECHO — NOT TRANSMITTED/);
        for (let i = 0; i < 8; i++) {
            await key('Tab');
            assert.equal(await evaluate("document.activeElement === document.body || !!document.activeElement.closest('#message-dialog')"), true);
        }
        await key('Escape');
        await until("!document.getElementById('message-dialog').open && document.getElementById('message-text').value === ''");
        assert.equal(await evaluate("document.getElementById('message-text').value"), '');
        assert.equal(await evaluate("document.getElementById('preview-text').textContent"), '');
        assert.equal(await evaluate('sessionStorage.length'), 1);
    });

    await check('long archives paginate to actual height, preserve every character and allow keyboard and touch paging', async () => {
        const fixture = ['QA ONLY: extended paragraph 👁 with safe text and wrapping. '.repeat(240) + '\nEND OF FIRST PAGE\n', 'QA SECOND EDITORIAL PAGE'];
        await evaluate(`import('./logs.mjs').then(({LOGS})=>LOGS[0].pages.push(...${JSON.stringify(fixture)}))`);
        for (const [width, height] of [[1920, 1080], [390, 844]]) {
            await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
            await delay(100);
            await submit('execute bartmoss-manifest');
            assert.equal(await evaluate("document.getElementById('output-pages').hidden"), false);
            const first = await output();
            await traceAction("document.getElementById('next-page').click()");
            await assertTyped();
            assert.notEqual(await output(), first);
            await key('PageUp');
            await ready();
            assert.equal(await output(), first);
            if (width < 600) {
                await call('Emulation.setTouchEmulationEnabled', { enabled: true });
                const point = await evaluate("(()=>{const r=document.getElementById('next-page').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
                await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
                await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
                await ready();
                assert.notEqual(await output(), first);
            }
            assert.equal((await allPages('.log-text')).join(''), fixture.join(''));
        }
        await evaluate("import('./logs.mjs').then(({LOGS})=>LOGS[0].pages.splice(0))");
    });

    await check('responsive desktop, tablet, narrow phones, landscape and software-keyboard height', async () => {
        await submit('clear'); await submit('reboot');
        for (const [width, height] of [[1920, 1080], [1366, 768], [768, 1024], [390, 844], [320, 568], [844, 390], [390, 400], [390, 300]]) {
            await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
            await delay(120);
            await ready();
            const metrics = await evaluate("({width:innerWidth,scroll:document.documentElement.scrollWidth,input:document.getElementById('command').getBoundingClientRect().toJSON(),height:visualViewport.height,header:document.querySelector('.station-header').getBoundingClientRect().toJSON(),console:document.querySelector('.crt').getBoundingClientRect().toJSON(),close:document.querySelector('.return-link').getBoundingClientRect().toJSON(),notice:document.querySelector('.footer-return > span').getBoundingClientRect().toJSON()})");
            assert.ok(metrics.scroll <= metrics.width, JSON.stringify(metrics));
            assert.ok(metrics.input.bottom <= metrics.height, JSON.stringify(metrics));
            assert.ok(metrics.input.width > 120, JSON.stringify(metrics));
            assert.ok(metrics.header.height <= 36, JSON.stringify(metrics));
            assert.ok(metrics.close.top >= metrics.notice.bottom, JSON.stringify(metrics));
            assert.ok(metrics.close.bottom <= metrics.height, JSON.stringify(metrics));
            if (height >= 768) assert.ok(metrics.console.height / height > .8, JSON.stringify(metrics));
            assert.equal(await evaluate("document.querySelector('header .return-link')"), null);
            for (const value of ['help', 'list', 'status', 'execute bartmoss-manifest', 'clear', 'exit', 'n', 'interpreter', 'hello', 'back']) {
                await submit(value);
                const layout = await evaluate("({input:document.getElementById('command').getBoundingClientRect().toJSON(),scroll:document.documentElement.scrollWidth,top:document.getElementById('transcript').scrollTop})");
                assert.equal(layout.input.y, metrics.input.y, `No input movement for ${width}x${height}: ${value}`);
                assert.ok(layout.input.bottom <= height && layout.scroll <= width);
                if (value === 'list') {
                    const names = (await allPages()).filter(text => !text.startsWith('>'));
                    assert.equal(names.length, 18);
                    assert.equal(names.at(-1), 'The Final Operator — AVAILABLE');
                    if (height <= 400) assert.equal(await evaluate("document.getElementById('output-pages').hidden"), false);
                }
            }
            await submit('reboot');
            const shot = await call('Page.captureScreenshot', { format: 'png' });
            await writeFile(join(artifacts, `station-${width}x${height}.png`), Buffer.from(shot.data, 'base64'));
        }
    });

    await check('reduced motion, focus indicators and browser accessibility tree', async () => {
        await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
        assert.equal(await evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"), true);
        assert.equal(await evaluate("getComputedStyle(document.getElementById('command')).animationName"), 'none');
        await traceCommand('whoami');
        await ready(); await delay(30);
        const trace = await evaluate('window.stationRenderTrace');
        const complete = await output();
        assert.equal(trace[0].text, '');
        assert.ok(trace.some(sample => sample.text === '' && sample.disabled));
        assert.ok(trace.every(sample => sample.text === '' || sample.text === complete), 'Reduced Motion skips intermediate typing');
        assert.equal(await evaluate('document.activeElement.id'), 'command');
        await evaluate("document.getElementById('command').focus()");
        assert.notEqual(await evaluate("getComputedStyle(document.getElementById('command')).outlineStyle"), 'none');
        const tree = await call('Accessibility.getFullAXTree');
        assert.ok(tree.nodes.some(n => n.role?.value === 'textbox' && n.name?.value === 'Terminal command'));
        assert.ok(tree.nodes.some(n => n.role?.value === 'region' && n.name?.value === 'Terminal output'));
        assert.ok(tree.nodes.some(n => n.role?.value === 'link' && n.name?.value.includes('CLOSE / RETURN TO SITE')));
    });

    await check('extremely short viewport keeps controls reachable and allows internal scrolling', async () => {
        await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 240, deviceScaleFactor: 1, mobile: true });
        await delay(100);
        await submit('help');
        const layout = await evaluate("({input:document.getElementById('command').getBoundingClientRect().toJSON(),close:document.querySelector('.return-link').getBoundingClientRect().toJSON(),transcript:document.getElementById('transcript').getBoundingClientRect().toJSON(),scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.getElementById('transcript').scrollHeight,clientHeight:document.getElementById('transcript').clientHeight})");
        assert.ok(layout.input.bottom <= 240 && layout.close.bottom <= 240 && layout.scrollWidth <= 390, JSON.stringify(layout));
        assert.ok(layout.transcript.height > 0);
        await evaluate("document.getElementById('transcript').scrollTop=100000");
        assert.ok(await evaluate("document.getElementById('transcript').scrollTop > 0"));
        await submit('clear');
        await key('Tab');
        assert.equal(await evaluate('document.activeElement.id'), 'run-command');
        await key('Tab');
        assert.equal(await evaluate("document.activeElement.classList.contains('return-link')"), true);
    });

    await check('return link, Escape, browser back and actual contact navigation', async () => {
        await evaluate("document.querySelector('.return-link').click()");
        await until("location.pathname === '/tech/index.html' && document.readyState === 'complete'");
        assert.equal(await evaluate("!!document.querySelector('.station-entry')"), true);
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.station-entry span')).animationName"), 'none');
        await evaluate("document.querySelector('.station-entry a').click()");
        await until("location.pathname === '/station/index.html' && document.getElementById('command')?.disabled === false");
        await key('Escape');
        await until("location.pathname === '/tech/index.html' && document.readyState === 'complete'");
        await evaluate('history.back()');
        await until("location.pathname === '/station/index.html' && document.getElementById('command')?.disabled === false");
        await submit('contact');
        await until("location.pathname === '/options/email.html' && document.readyState === 'complete'");
    });

    await check('station has no external requests or browser errors', async () => {
        assert.deepEqual(errors, []);
        assert.deepEqual(requests.filter(url => !url.startsWith(origin)), []);
    });
    await writeFile(join(artifacts, 'results.json'), JSON.stringify({ checks, errors, requests, artifacts }, null, 2));
    console.log(`\n${checks.length} browser groups passed. Screenshots and results: ${artifacts}`);
} finally {
    socket?.close();
    processHandle.kill('SIGTERM');
}
