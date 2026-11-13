// Real-browser checks, no npm dependencies. Node 22+ and installed Chrome.
// Run from the repository root: node tests/gta6_browser.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const artifacts = await mkdtemp(join(tmpdir(), 'gta6-browser-'));
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const widths = [320, 390, 430, 768, 1440, 1920];
const checks = [];
const requests = [];
const errors = [];
const pending = new Map();
let chrome, socket, nextId = 0;
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
    try {
        const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
        if (!path.startsWith(root + '/')) throw Error('Invalid path');
        res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream');
        res.end(await readFile(path));
    } catch { res.writeHead(404); res.end('Not found'); }
});
const delay = ms => new Promise(r => setTimeout(r, ms));
const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => { pending.delete(id); reject(Error(`Timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function until(expression) {
    for (let i = 0; i < 100; i++) {
        if (await evaluate(expression)) return;
        await delay(50);
    }
    throw Error(`Condition failed: ${expression}`);
}
async function key(key, modifiers = 0) {
    for (const type of ['keyDown', 'keyUp']) await command('Input.dispatchKeyEvent', {
        type, key, code: key, modifiers, text: type === 'keyDown' && key === 'Enter' ? '\r' : undefined,
        windowsVirtualKeyCode: { Tab: 9, Enter: 13, Escape: 27 }[key]
    });
}
const noOverflow = async (checkDescendants = true) => {
    const result = await evaluate(`({ width: innerWidth, scroll: document.documentElement.scrollWidth,
        outside: [...document.querySelectorAll('main *')].filter(e => {
            const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1);
        }).map(e => e.className) })`);
    assert.ok(result.scroll <= result.width, JSON.stringify(result));
    if (checkDescendants) assert.deepEqual(result.outside, [], JSON.stringify(result));
};
async function check(name, run) { await run(); checks.push(name); console.log(`PASS ${name}`); }
async function screenshot(name, full = false) {
    const params = { format: 'png', captureBeyondViewport: full };
    if (full) {
        const { cssContentSize } = await command('Page.getLayoutMetrics');
        params.clip = { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 };
    }
    const { data } = await command('Page.captureScreenshot', params);
    await writeFile(join(artifacts, name + '.png'), Buffer.from(data, 'base64'));
}

try {
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const origin = `http://127.0.0.1:${server.address().port}`;
    chrome = spawn(chromePath, ['--headless', '--disable-gpu', '--no-first-run', '--disable-background-networking', '--disable-sync', '--password-store=basic', '--use-mock-keychain', '--remote-debugging-port=0', `--user-data-dir=${artifacts}/profile`, 'about:blank'], { stdio: 'ignore' });
    let port;
    for (let i = 0; i < 100; i++) {
        try { port = Number((await readFile(join(artifacts, 'profile/DevToolsActivePort'), 'utf8')).split('\n')[0]); break; }
        catch { await delay(100); }
    }
    assert.ok(port, 'Chrome starts');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.id) {
            const job = pending.get(message.id);
            if (!job) return;
            clearTimeout(job.timeout); pending.delete(message.id);
            if (message.error) job.reject(Error(JSON.stringify(message.error))); else job.resolve(message.result);
        } else if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
        else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
        else if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) errors.push(message.params.response);
        else if (message.method === 'Network.loadingFailed') errors.push(message.params);
    });
    await command('Page.enable'); await command('Runtime.enable'); await command('Network.enable');
    let navigationId = 0;
    const navigate = async path => {
        await evaluate('window.__gta6QaLeaving = true');
        await command('Page.navigate', { url: origin + path + '?qa=' + (++navigationId) });
        await until(`!window.__gta6QaLeaving && location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete'`);
        await evaluate('document.fonts.ready.then(() => true)');
    };
    const viewport = width => command('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });

    await check('RDR2 header and footer preserved', async () => {
        const rdr = await readFile(join(root, 'gaming/rdr2.html'), 'utf8');
        const gta = await readFile(join(root, 'gaming/gta6.html'), 'utf8');
        const part = (html, tag) => html.match(new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`))[0];
        assert.equal(part(gta, 'header'), part(rdr, 'header'));
        assert.equal(part(gta, 'footer').replaceAll('gta6.html', 'rdr2.html'), part(rdr, 'footer'));
    });
    for (const width of widths) await check(`GTA VI layout and navigation at ${width}px`, async () => {
        await viewport(width); await navigate('/gaming/gta6.html');
        await noOverflow();
        assert.equal(await evaluate(`(() => {
            const passport = document.querySelector('.gta6-passport').getBoundingClientRect();
            return [...document.querySelectorAll('.gta6-passport__facts')].every(list => {
                const cells = [...list.children].map(cell => cell.getBoundingClientRect());
                return cells.every((cell, i) => cell.left >= passport.left && cell.right <= passport.right &&
                    cells.every((other, j) => i === j || cell.right <= other.left || cell.left >= other.right || cell.bottom <= other.top || cell.top >= other.bottom)) &&
                    [...list.children].every(cell => cell.querySelector('dd').getBoundingClientRect().top >= cell.querySelector('dt').getBoundingClientRect().bottom);
            });
        })()`), true, 'Passport metadata fits without overlapping');
        assert.equal(await evaluate("document.querySelector('.mobile-menu__toggle').getBoundingClientRect().width > 0"), width < 850);
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.site-nav')).display !== 'none'"), width >= 850);
        assert.equal(await evaluate("getComputedStyle(document.body).backgroundImage.includes('cyberpunk')"), false);
        assert.equal(await evaluate("document.querySelectorAll('iframe, video').length"), 0);
        assert.equal(await evaluate("document.querySelectorAll('.gta6-postcard, [href=\"#\"]').length"), 0, 'No empty cards or dead links');
        const receipt = await evaluate(`(() => { const img = document.querySelector('.gta6-ticket__receipt img');
            const r = img.getBoundingClientRect(); return { width: r.width, height: r.height, fit: getComputedStyle(img).objectFit,
                alt: img.alt, link: img.closest('a').getAttribute('href') }; })()`);
        assert.ok(receipt.width > 220, 'Receipt uses available screen width');
        assert.ok(Math.abs(receipt.width / receipt.height - 4 / 3) < 0.001, 'Entire screenshot keeps its 4:3 aspect ratio');
        assert.equal(receipt.fit, 'contain');
        assert.match(receipt.alt, /Ultimate Edition.*19 November 2026.*Im Besitz/);
        assert.equal(receipt.link, '../essentials/gaming/gta6/gta6_preorder.jpg');
        await evaluate("document.querySelector('.gta6-ticket__receipt img').scrollIntoView()");
        await until("document.querySelector('.gta6-ticket__receipt img').complete && document.querySelector('.gta6-ticket__receipt img').naturalWidth === 1536");
        await evaluate("document.querySelector('.gta6-ticket__receipt img').decode().then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))");
        await evaluate('scrollTo(0, 0)');
        await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
        const title = await evaluate(`(() => {const t = document.querySelector('h1'), r = t.getBoundingClientRect(), p = t.closest('section').getBoundingClientRect();
            return { fits: r.right <= p.right && r.left >= p.left, font: getComputedStyle(t).fontFamily };})()`);
        assert.ok(title.fits); assert.match(title.font, /Space Grotesk/);
        await screenshot(`gta6-${width}`, [320, 390, 768, 1440].includes(width));
    });
    await check('Local fonts decode and page resources load without errors', async () => {
        await evaluate("document.querySelector('#ticket').scrollIntoView()");
        await until("document.querySelector('.gta6-ticket__receipt img').complete && document.querySelector('.gta6-ticket__receipt img').naturalWidth === 1536");
        assert.equal(await evaluate("document.querySelector('.gta6-ticket__receipt img').naturalHeight"), 1152);
        for (const family of ['Inter', 'Space Grotesk', 'Geist Mono', 'Silkscreen']) {
            assert.equal(await evaluate(`document.fonts.check('16px ${JSON.stringify(family)}')`), true, family);
            assert.ok(await evaluate(`[...document.fonts].some(f => f.family.replaceAll('"', '') === ${JSON.stringify(family)} && f.status === 'loaded')`), family);
        }
        assert.deepEqual(errors, []);
        assert.ok(requests.every(url => url.startsWith(origin) || url.startsWith('data:')), 'No hotlinked resources or remote embeds');
    });
    await check('Keyboard skip link and passport jump', async () => {
        await viewport(390); await navigate('/gaming/gta6.html');
        await key('Tab');
        assert.equal(await evaluate('document.activeElement.textContent.trim()'), 'Skip to content');
        await key('Enter');
        assert.equal(await evaluate('document.activeElement.id'), 'main-content');
        await key('Tab');
        assert.equal(await evaluate('document.activeElement.hash'), '#passport');
        assert.notEqual(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'none');
        await key('Enter');
        await until("location.hash === '#passport'");
        assert.ok(await evaluate("document.querySelector('#passport').getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom"));
    });
    await check('Mobile menu opens, traps focus, closes with Escape and resets on desktop', async () => {
        await navigate('/gaming/gta6.html');
        await evaluate("document.querySelector('.mobile-menu__toggle').focus()");
        assert.equal(await evaluate('document.activeElement.className'), 'mobile-menu__toggle');
        await key('Enter');
        await until("document.querySelector('.mobile-menu__toggle').getAttribute('aria-expanded') === 'true'");
        await key('Tab', 8);
        assert.equal(await evaluate('document.activeElement.textContent.trim()'), 'Impressum');
        await key('Tab');
        assert.equal(await evaluate('document.activeElement.className'), 'mobile-menu__toggle');
        await key('Escape');
        assert.equal(await evaluate("document.querySelector('.mobile-menu__panel').hidden"), true);
        assert.equal(await evaluate('document.activeElement.className'), 'mobile-menu__toggle');
        await key('Enter'); await viewport(1440);
        await until("document.querySelector('.mobile-menu__panel').hidden && !document.body.classList.contains('menu-open')");
    });
    await check('Passport wraps additional stamps at 320px', async () => {
        await viewport(320); await navigate('/gaming/gta6.html');
        await evaluate(`(() => {const list = document.querySelector('.gta6-passport__stamps'); for(let i=0;i<6;i++) list.append(list.firstElementChild.cloneNode(true));})()`);
        await noOverflow();
    });
    await check('Prepared gallery supports future portrait and landscape photographs', async () => {
        await viewport(1440); await navigate('/gaming/gta6.html');
        await evaluate(`(() => {
            const gallery = document.createElement('div'); gallery.className = 'gta6-gallery';
            document.querySelector('#postcards').append(gallery);
            for(let i = 0; i < 3; i++) {
            const figure = document.createElement('figure'); figure.className = 'gta6-postcard'; gallery.append(figure);
            const img = document.createElement('img'); const w = i === 1 ? 90 : 160, h = i === 1 ? 160 : 90;
            img.width = w; img.height = h; img.alt = 'QA geometry fixture'; img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"></svg>');
            figure.append(img);
        }})()`);
        await until("[...document.querySelectorAll('.gta6-postcard img')].every(img => img.complete && img.naturalWidth > 0)");
        for (const width of widths) {
            await viewport(width); await noOverflow();
            assert.equal(await evaluate(`[...document.querySelectorAll('.gta6-postcard img')].every(img => {
                const r = img.getBoundingClientRect(); return Math.abs(r.width/r.height - img.naturalWidth/img.naturalHeight) < 0.02 && getComputedStyle(img).filter === 'none'; })`), true);
        }
    });
    await check('Installation milestone stays dated and personal arrival stays pending after release', async () => {
        for (const date of ['2026-11-13T12:00:00Z', '2026-11-18T12:00:00Z', '2026-11-19T00:00:00Z', '2026-11-20T12:00:00Z', '2027-01-01T12:00:00Z']) {
            const { identifier } = await command('Page.addScriptToEvaluateOnNewDocument', { source: `{
                const OriginalDate = Date, expected = OriginalDate.parse(${JSON.stringify(date)});
                window.Date = class extends OriginalDate { constructor(...args) { super(...(args.length ? args : [expected])); } static now() { return expected; } };
            }` });
            await navigate('/gaming/gta6.html');
            const facts = await evaluate(`Object.fromEntries([...document.querySelectorAll('.gta6-passport__facts > div')].map(e => [e.querySelector('dt').textContent, e.querySelector('dd').textContent]))`);
            assert.deepEqual(facts, { 'Passport ID': 'NL-VC-0001', Destination: 'Vice City, Leonida', Platform: 'Xbox Series X', Edition: 'Ultimate Edition', 'Personal travel status': 'ARRIVAL PENDING', 'Expected arrival': '19 November 2026', 'First arrival': 'NOT YET RECORDED', 'Install size (base game)': '209.9 GB', 'Game build': '1.0.1.3' });
            assert.match(await evaluate("document.querySelector('.gta6-passport__milestone').textContent"), /13 NOV 2026 \/ GAME INSTALLED\s+READY FOR DEPARTURE/);
            assert.deepEqual(await evaluate("[...document.querySelectorAll('[datetime=\"2026-11-13\"]')].map(t => t.textContent)"), ['13 NOV 2026', '13 NOV 2026']);
            assert.equal(await evaluate("document.querySelector('.gta6-passport__stamps').children.length"), 1, 'Installation adds no travel stamp');
            assert.equal(await evaluate("document.querySelector('.gta6-passport__stamp').firstChild.textContent"), 'ARRIVAL PENDING');
            assert.equal(await evaluate("document.querySelector('.gta6-hero__folio .gta6-status').textContent"), 'Arrival pending');
            assert.match(await evaluate("document.querySelector('.gta6-ticket__facts').textContent"), /Pre-ordered \/ In possession/);
            assert.equal(await evaluate("document.querySelectorAll('[data-countdown], .countdown').length"), 0);
            await command('Page.removeScriptToEvaluateOnNewDocument', { identifier });
        }
    });
    await check('Reduced motion removes page and menu transitions', async () => {
        await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
        await navigate('/gaming/gta6.html');
        assert.equal(await evaluate(`[...document.querySelectorAll('.gta6-main *, .mobile-menu__icon')].every(e => {
            const s = getComputedStyle(e); return s.transitionDuration.split(',').every(t => parseFloat(t) === 0) && s.animationName === 'none'; })`), true);
        await command('Emulation.setEmulatedMedia', { features: [] });
    });
    await check('Gaming hub entry and local navigation targets resolve', async () => {
        for (const width of widths) { await viewport(width); await navigate('/gaming/index.html'); await noOverflow(); }
        assert.equal(await evaluate("document.querySelectorAll('.gaming-game-nav__grid a').length"), 3);
        assert.match(await evaluate("document.querySelector('.gaming-game-nav__grid > :first-child').textContent"), /PRE-LAUNCH.*ARRIVAL PENDING/s);
        for (const title of ['CYBERPUNK 2077', 'RED DEAD REDEMPTION 2', 'POKÉMON GO', 'RETRO GAMING']) {
            assert.ok(await evaluate(`document.querySelector('.gaming-game-nav__grid').textContent.includes(${JSON.stringify(title)})`));
        }
        await evaluate("document.querySelector('a[href=\"./gta6.html\"]').click()");
        await until("location.pathname === '/gaming/gta6.html' && document.readyState === 'complete'");
        const links = await evaluate(`[...document.querySelectorAll('a[href]')].map(a => a.href)`);
        for (const link of new Set(links.filter(url => url.startsWith(origin)))) {
            if (new URL(link).hash) assert.equal(await evaluate(`!!document.getElementById(${JSON.stringify(new URL(link).hash.slice(1))})`), true);
            else assert.equal((await fetch(link)).status, 200, link);
        }
    });
    for (const path of ['/gaming/rdr2.html', '/gaming/cyberpunk2077.html']) await check(`Existing game smoke test: ${path}`, async () => {
        for (const width of [320, 768, 1440]) {
            // Cyberpunk has an existing table that scrolls inside its wrapper.
            // Check document overflow, allowing that deliberately wider table.
            await viewport(width); await navigate(path); await noOverflow(false);
            assert.equal(await evaluate("!!document.querySelector('link[href$=\"gta6.css\"]')"), false);
            assert.equal(await evaluate("getComputedStyle(document.body).backgroundImage.includes('cyberpunk')"), true);
        }
    });
    await check('Game pages have no broken images or browser exceptions', async () => {
        assert.equal(await evaluate("[...document.images].filter(img => img.complete).every(img => img.naturalWidth > 0)"), true);
        assert.deepEqual(errors, []);
    });
    await writeFile(join(artifacts, 'report.json'), JSON.stringify({ checks, errors, widths, requests: [...new Set(requests)] }, null, 2));
    console.log(`\n${checks.length} checks passed. Screenshots and report: ${artifacts}`);
} finally {
    socket?.close();
    chrome?.kill();
    server.close();
}
