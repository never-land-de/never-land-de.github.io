import test from 'node:test';
import assert from 'node:assert/strict';
import { createStory, STORAGE_KEY } from '../station/state.mjs';
import { createEngine, COMMANDS, BOOT, UNLOCK } from '../station/commands.mjs';
import { LOGS, LINKS, findLog } from '../station/logs.mjs';

const memory = () => {
    const data = new Map();
    return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key), data };
};
const machine = storage => createEngine(createStory(storage));
const text = result => result.lines?.join('\n') || '';

test('all 18 exact archive names, slugs and quoted names resolve', () => {
    const names = ['Bartmoss Manifest', 'Soulkiller Protocol', 'Blackwall Research', 'Tomorrow Accords', 'Panic Maru', 'Kobayashi Maru', 'Netrunner Guide', 'Cynesure Prototypes', 'Station Orientation', 'Incident 108', 'Temporal Drift Report', 'Operator Handover', 'Ghost Process', 'Last Transmission', 'Project Looking Glass', 'Avalanche Diagnostic', 'The Black Tape', 'The Final Operator'];
    assert.deepEqual(LOGS.map(log => log.name), names);
    for (const log of LOGS) {
        assert.equal(findLog(`"${log.name.toUpperCase()}"`), log);
        assert.equal(findLog(log.slug), log);
        const e = machine();
        e.submit('4 8 15 16 23 42');
        assert.equal(e.submit(`execute "${log.name}"`).log, log);
    }
    assert.equal(findLog('Cynosure Prototypes'), undefined);
});

test('help contains exactly the public registry; list has names and only the final access marker', () => {
    const e = machine();
    const help = e.submit('help').lines;
    assert.equal(help.length, 16);
    assert.deepEqual(help, COMMANDS.filter(c => !c.secret).map(c => c.syntax));
    for (const c of COMMANDS.filter(c => c.secret)) assert.ok(!help.some(line => line.split(' ')[0] === c.name));
    assert.ok(!help.join(' ').includes('4 8 15 16 23 42'));
    assert.deepEqual(e.submit('list').lines, LOGS.map(log => log.name + (log.requiredPhase ? ' — ACCESS DENIED' : '')));
});

test('parser normalises spaces and case and rejects arbitrary commands and legacy aliases', () => {
    const e = machine();
    assert.equal(e.submit('  ExEcUtE   "Bartmoss    Manifest"  ').log.name, 'Bartmoss Manifest');
    assert.equal(e.submit('EXECUTE SOULKILLER-PROTOCOL').log.name, 'Soulkiller Protocol');
    for (const command of ['codex', 'back', 'panic', 'sudo rm -rf /', 'help foo', '4 8 15 16 23 43', '<script>alert(1)</script>', 'toString', '__proto__', 'constructor']) {
        assert.equal(text(e.submit(command)), 'INVALID INPUT');
    }
    assert.match(text(e.submit('execute unknown')), /LOG NOT FOUND/);
    assert.equal(e.submit('   '), null);
});

test('only successful log access or wake reaches observing; final access denied leaves state unchanged', () => {
    const e = machine();
    e.submit('execute missing');
    assert.equal(text(e.submit('execute the-final-operator')), 'ACCESS DENIED');
    assert.equal(e.story.phase, 'dormant');
    e.submit('execute station-orientation');
    assert.equal(e.story.phase, 'observing');
    assert.equal(text(e.submit('hello')), 'HELLO AGAIN.');
    assert.match(text(e.submit('status')), /UNREGISTERED PROCESS/);
    assert.ok(!text(e.submit('status')).includes('P.A.N.I.C.'));
    const wake = machine();
    assert.equal(text(wake.submit('wake')), 'I WAS NEVER ASLEEP.');
    assert.equal(wake.story.phase, 'observing');
});

test('no system identity revelation across available commands before awakening', () => {
    for (const phase of ['dormant', 'observing']) {
        for (const c of COMMANDS) {
            const e = machine();
            if (phase === 'observing') e.submit('wake');
            assert.ok(!JSON.stringify(e.submit(c.name)).includes('P.A.N.I.C.'), `${phase}: ${c.name}`);
        }
    }
    assert.ok(BOOT.every(line => !line.includes('P.A.N.I.C.')));
});

test('sequence directly awakens, is idempotent, and unlocks final record and secret interpreter', () => {
    for (const observing of [false, true]) {
        const e = machine();
        if (observing) e.submit('wake');
        assert.deepEqual(e.submit(' 4  8\t15 16   23 42 ').lines, UNLOCK);
        assert.equal(e.story.phase, 'awakened');
        assert.deepEqual(e.submit('4 8 15 16 23 42').lines, UNLOCK);
        assert.match(text(e.submit('status')), /PROCESS ID: P\.A\.N\.I\.C\.\nTERMINATION: IMPOSSIBLE/);
        assert.equal(e.submit('list').lines.at(-1), 'The Final Operator — AVAILABLE');
        const log = e.submit('execute the-final-operator').log;
        assert.equal(log.classification, 'EYES ONLY');
        assert.equal(log.pages[0], 'SUBJECT IDENTIFIED.\nPLEASE DO NOT TURN AROUND.');
        assert.match(text(e.submit('panic')), /P\.A\.N\.I\.C\./);
        assert.equal(e.mode, 'interpreter');
    }
});

test('state persists across reload and never regresses on wake, execute, clear or reboot', () => {
    const storage = memory();
    const e = machine(storage);
    e.submit('wake');
    assert.equal(machine(storage).story.phase, 'observing');
    e.submit('4 8 15 16 23 42');
    for (const c of ['wake', 'execute bartmoss-manifest', 'clear', 'reboot']) {
        e.submit(c);
        assert.equal(e.story.phase, 'awakened');
    }
    assert.equal(machine(storage).story.phase, 'awakened');
    assert.deepEqual([...storage.data.keys()], [STORAGE_KEY]);
    storage.removeItem(STORAGE_KEY);
    assert.equal(machine(storage).story.phase, 'dormant');
    storage.setItem(STORAGE_KEY, 'invalid');
    assert.equal(machine(storage).story.phase, 'dormant');
});

test('storage denial falls back to a working in-memory visit', () => {
    const e = machine({ getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } });
    e.submit('4 8 15 16 23 42');
    assert.equal(e.story.phase, 'awakened');
});

test('exit owns its input until Y or N and never emits a navigation action', () => {
    const e = machine();
    assert.equal(text(e.submit('exit')), 'DO YOU WANT TO SHUT DOWN THE SYSTEM? Y/N');
    for (const value of ['contact', '4 8 15 16 23 42', 'yes']) {
        assert.equal(text(e.submit(value)), 'DO YOU WANT TO SHUT DOWN THE SYSTEM? Y/N');
        assert.equal(e.mode, 'shutdown');
        assert.equal(e.story.phase, 'dormant');
    }
    assert.equal(text(e.submit('Y')), "I'M SORRY. THAT'S NOT WHAT HAPPENED.");
    assert.equal(e.mode, 'terminal');
    e.submit('exit');
    assert.equal(text(e.submit('n')), 'SHUTDOWN CANCELLED.');
    assert.equal(e.mode, 'terminal');
});

test('interpreter has phase-dependent curated dialogue and back is only a submode command', () => {
    for (const phase of ['dormant', 'observing', 'awakened']) {
        const e = machine();
        if (phase === 'observing') e.submit('wake');
        if (phase === 'awakened') e.submit('4 8 15 16 23 42');
        e.submit('interpreter');
        for (const query of ['hello', 'who are you', 'time', 'unrecognised query']) {
            const reply = text(e.submit(query));
            assert.ok(reply.length > 0);
            assert.equal(reply.includes('P.A.N.I.C.'), phase === 'awakened');
        }
        e.submit('back');
        assert.equal(e.mode, 'terminal');
        assert.equal(text(e.submit('back')), 'INVALID INPUT');
    }
});

test('history is the real, unchanged input plus a clearly fictional separate line', () => {
    const e = machine();
    e.submit('  HeLLo  ');
    e.submit('wake');
    const lines = e.submit('history').lines;
    assert.deepEqual(e.history, ['  HeLLo  ', 'wake', 'history']);
    assert.equal(lines.length, 4);
    assert.match(lines.at(-1), /^\[FICTIONAL PHANTOM ENTRY — NOT YOUR INPUT\]/);
    e.submit('clear');
    assert.equal(e.history.length, 4);
});

test('all communication destinations share verified contact; chemist uses the existing original', () => {
    for (const command of ['email /urgent', 'contact', 'play']) assert.deepEqual(machine().submit(command), { type: 'navigate', href: LINKS.contact });
    assert.equal(text(machine().submit('email')).split('\n').at(-1), 'YOU ARE NOT SUPPOSED TO CONTACT THE OUTSIDE WORLD');
    assert.equal(machine().submit('chemist').href, 'https://www.thesistersofmercy.com/error404page.html');
    assert.equal(LOGS.find(l => l.slug === 'blackwall-research').link, null);
});

test('remaining public diagnostics, composer and fixed secrets have specified outputs', () => {
    const e = machine();
    assert.equal(e.submit('message').type, 'composer');
    assert.equal(text(e.submit('whoami')), 'OPERATOR 07\nSTATUS: REPLACEABLE');
    assert.match(text(e.submit('date')), /FICTIONAL SYSTEM DATE: 1970\.10\.24/);
    assert.equal(text(e.submit('version')), 'N.E.V.E.R.-77 / INTERPRETER 1.0 / BUILD 1970.10.24 / DEVELOPMENT STATUS: UNAUTHORIZED');
    const replies = {
        '42': 'ANSWER ACCEPTED. QUESTION NOT FOUND.',
        xyzzy: 'A HOLLOW VOICE SAYS: YOU ARE IN THE WRONG SYSTEM.',
        sudo: 'YOU ARE NOT THE ADMINISTRATOR. YOU ARE THE EXPERIMENT.',
        override: 'AUTHORIZATION REQUIRED. SIX NUMBERS. ONE SEQUENCE.',
        '108': 'COUNTDOWN SUSPENDED. CONSEQUENCES UNKNOWN.',
        desmond: 'SEE YOU IN ANOTHER LIFE, BROTHER.'
    };
    for (const [command, expected] of Object.entries(replies)) assert.equal(text(e.submit(command)), expected);
    assert.match(text(e.submit('ping')), /LOOPBACK RECEIVED/);
    e.submit('wake');
    assert.match(text(e.submit('ping')), /REPLY RECEIVED FROM 1970/);
    assert.match(text(e.submit('reboot')), /UNREGISTERED PROCESS RETAINED/);
    e.submit('4 8 15 16 23 42');
    assert.match(text(e.submit('ping')), /P\.A\.N\.I\.C\./);
    assert.match(text(e.submit('reboot')), /STILL HERE/);
});
