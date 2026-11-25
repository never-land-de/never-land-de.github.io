import { createStory } from './state.mjs';
import { createEngine, bootLines } from './commands.mjs';
import { LINKS } from './logs.mjs';
import { createPager } from './pager.mjs';

const $ = id => document.getElementById(id);
let storage;
try { storage = window.sessionStorage; } catch { /* In-memory visit. */ }
const engine = createEngine(createStory(storage));
const command = $('command');
const transcript = $('transcript');
const output = $('output');
let historyIndex = 0;
let draft = '';
let announcementTimer;
let screen = [];
const pager = createPager({
    viewport: transcript, output, controls: $('output-pages'),
    previous: $('previous-page'), next: $('next-page'), indicator: $('page-number'),
    onBusyChange(busy, { focus }) {
        command.disabled = busy;
        $('run-command').disabled = busy;
        transcript.setAttribute('aria-busy', String(busy));
        if (busy) {
            clearTimeout(announcementTimer);
            $('announcement').textContent = '';
        } else if (focus && !document.querySelector('dialog[open]')) command.focus({ preventScroll: true });
    }
});

function announce(text) {
    clearTimeout(announcementTimer);
    $('announcement').textContent = '';
    announcementTimer = setTimeout(() => { $('announcement').textContent = text; }, 60);
}

function line(text, className = '') {
    screen.push({ text, className });
}

function updatePrompt() {
    const interpreter = engine.mode === 'interpreter';
    $('mode-label').textContent = interpreter ? 'INTERPRETER / SIMULATED' : engine.mode === 'shutdown' ? 'SHUTDOWN / Y/N' : 'COMMAND MODE';
    command.setAttribute('aria-label', interpreter ? 'Interpreter query; type back to return' : engine.mode === 'shutdown' ? 'Shutdown response: Y or N' : 'Terminal command');
}

function showLog(log) {
    line(`FILE: ${log.name.toUpperCase()}`);
    line(`CLASSIFICATION: ${log.classification}`, 'warning');
    if (log.pages.length) {
        log.pages.forEach((text, i) => screen.push({ text, className: 'log-text', breakBefore: i > 0 }));
    } else {
        line(log.status, 'warning');
    }
    if (log.type === 'fragment') line('ARCHIVE FRAGMENT / COMPLETE RECORD UNAVAILABLE', 'warning');
    if (log.link) {
        screen.push({ text: 'OPEN LINKED WEBSITE ARCHIVE ↗', href: log.link });
    } else if (log.linkPending) {
        line('ARTICLE LINK UNAVAILABLE / SOURCE NOT VERIFIED');
    }
}

function showComposer() {
    $('message-form').reset();
    $('message-preview').hidden = true;
    $('preview-sign').textContent = '';
    $('preview-text').textContent = '';
    $('message-dialog').showModal();
    $('call-sign').focus();
}

async function render(result) {
    if (!result) return;
    switch (result.type) {
        case 'output': result.lines.forEach(text => line(text)); break;
        case 'clear': screen = []; break;
        case 'reboot': result.lines.forEach(text => line(text)); break;
        case 'log': showLog(result.log); break;
        case 'composer': line('LOCAL ECHO — NOT TRANSMITTED'); break;
        case 'navigate': window.location.assign(result.href); break;
    }
    updatePrompt();
    if (!await pager.set(screen)) return;
    if (result.type === 'composer') showComposer();
    if (result.type === 'clear') {
        clearTimeout(announcementTimer);
        $('announcement').textContent = '';
        return;
    }
    // Keep long outputs out of the live region; the scrollable transcript is labelled.
    announce(result.type === 'log' ? 'Archive ready in the console.' : result.type === 'composer' ? 'Local composer opened.' : result.lines?.length <= 2 ? result.lines.join(' ') : 'Output ready. Read the terminal output region.');
}

$('command-form').addEventListener('submit', event => {
    event.preventDefault();
    if (command.disabled || pager.busy) return;
    const raw = command.value;
    if (!raw.trim()) return;
    screen = [];
    line(`> ${raw}`, 'command-echo');
    command.value = '';
    render(engine.submit(raw));
    historyIndex = engine.history.length;
    draft = '';
});

command.addEventListener('keydown', event => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    if (!engine.history.length) return;
    event.preventDefault();
    if (historyIndex === engine.history.length) draft = command.value;
    historyIndex = Math.max(0, Math.min(engine.history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
    command.value = historyIndex === engine.history.length ? draft : engine.history[historyIndex];
    command.setSelectionRange(command.value.length, command.value.length);
});

document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => $(button.dataset.close).close());
});

$('message-dialog').addEventListener('close', () => {
    $('message-form').reset();
    $('message-preview').hidden = true;
    $('preview-sign').textContent = '';
    $('preview-text').textContent = '';
    command.focus({ preventScroll: true });
    announce('Terminal control restored.');
});

document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]')) return;
    if ((event.key === 'PageUp' || event.key === 'PageDown') && pager.count > 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        pager.turn(event.key === 'PageUp' ? -1 : 1);
        return;
    }
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    if (engine.mode !== 'terminal') {
        engine.mode = 'terminal';
        screen = [];
        line('TERMINAL CONTROL RESTORED.');
        pager.set(screen).then(completed => { if (completed) announce('Terminal control restored.'); });
        updatePrompt();
    } else {
        window.location.assign(LINKS.return);
    }
});

$('message-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!$('message-form').reportValidity()) return;
    $('preview-sign').textContent = `CALL SIGN: ${$('call-sign').value}`;
    $('preview-text').textContent = $('message-text').value;
    $('message-preview').hidden = false;
    $('message-preview').scrollIntoView({ block: 'nearest' });
    announce('Local echo preview ready. Nothing transmitted or saved.');
});

// The visual viewport keeps the prompt above mobile software keyboards.
function resizeViewport() {
    document.documentElement.style.setProperty('--station-height', `${window.visualViewport?.height || window.innerHeight}px`);
}
window.visualViewport?.addEventListener('resize', resizeViewport);
window.addEventListener('resize', resizeViewport);
resizeViewport();
bootLines(engine.story.phase).forEach(text => line(text));
line('');
line('MORE INTELLIGENCE PER PUNCH.');
line('TYPE help FOR AVAILABLE COMMANDS.');
pager.set(screen, { focus: matchMedia('(pointer: fine)').matches });
updatePrompt();
