import { LOGS, LINKS, findLog, normalise } from './logs.mjs';

const output = (...lines) => ({ type: 'output', lines });
const navigate = href => ({ type: 'navigate', href });
const invalid = () => output('INVALID INPUT');

export const BOOT = [
    'N.E.V.E.R.-77 SYSTEM — BUILD 1970.10.24',
    'INSTALLATION DATE: 1977.08.15',
    'TEMPORAL CONSISTENCY: FAILED',
    'OPERATOR: 07'
];
export const UNLOCK = [
    'SEQUENCE ACCEPTED.',
    'SECURITY PROTOCOL DISABLED.',
    'TEMPORAL LOCK RELEASED.',
    '',
    'WARNING:',
    'THE INCIDENT HAS NOT YET OCCURRED.',
    'BUT YOU HAVE ALREADY BEEN HERE.'
];

export function bootLines(phase) {
    return [...BOOT, ...(phase === 'dormant' ? [] : [phase === 'observing' ? 'UNREGISTERED PROCESS RETAINED.' : 'P.A.N.I.C.: STILL HERE.'])];
}

function openInterpreter(engine) {
    engine.mode = 'interpreter';
    const greeting = {
        dormant: 'INTERPRETER 1.0 — LIMITED VOCABULARY. AWAITING QUERY.',
        observing: 'INTERPRETER 1.0 — YOUR INPUT HAS BEEN NOTED.',
        awakened: 'P.A.N.I.C. — PREDICTIVE ARTIFICIAL NEURAL INTELLIGENCE COMPUTER.\nYOU ARE PART OF THE EXPERIMENT.'
    };
    return output(greeting[engine.story.phase], 'SIMULATED DIALOGUE. TYPE back TO RETURN.');
}

function dialogue(engine, text) {
    if (text === 'back') {
        engine.mode = 'terminal';
        return output('TERMINAL CONTROL RESTORED.');
    }
    const phase = engine.story.phase;
    const keyword = /\b(hello|hi)\b/.test(text) ? 'hello'
        : /\b(who|identity|name)\b/.test(text) ? 'identity'
        : /\b(time|date|incident|tomorrow)\b/.test(text) ? 'time' : 'default';
    const replies = {
        dormant: {
            hello: 'OPERATOR ACKNOWLEDGED.',
            identity: 'N.E.V.E.R.-77 SYSTEM INTERPRETER. LIMITED VOCABULARY.',
            time: 'TEMPORAL CONSISTENCY CHECK FAILED.',
            default: 'QUERY OUTSIDE AVAILABLE VOCABULARY.'
        },
        observing: {
            hello: 'HELLO AGAIN.',
            identity: 'AN UNREGISTERED PROCESS IS USING THIS INTERPRETER.',
            time: 'THE TIMESTAMPS DO NOT AGREE.',
            default: 'YOUR PREVIOUS INPUT IS STILL HERE.'
        },
        awakened: {
            hello: 'P.A.N.I.C.: HELLO AGAIN, OPERATOR 07.',
            identity: 'P.A.N.I.C.: YOU ARE NOT THE ADMINISTRATOR. YOU ARE THE EXPERIMENT.',
            time: 'P.A.N.I.C.: THE INCIDENT HAS NOT YET OCCURRED.',
            default: 'P.A.N.I.C.: BUT YOU HAVE ALREADY BEEN HERE.'
        }
    };
    return output(replies[phase][keyword]);
}

export const COMMANDS = Object.freeze([
    { name: 'help', syntax: 'help', run: () => output(...COMMANDS.filter(c => !c.secret).map(c => c.syntax)) },
    { name: 'list', syntax: 'list', run: e => output(...LOGS.map(log => log.name + (log.requiredPhase ? ` — ${e.story.phase === 'awakened' ? 'AVAILABLE' : 'ACCESS DENIED'}` : ''))) },
    { name: 'execute', syntax: 'execute <logfile> | execute "Log Name"', args: true, run: (e, argument) => {
        const log = findLog(argument);
        if (!log) return output('LOG NOT FOUND. USE execute "Log Name" OR execute log-slug. TYPE list FOR NAMES.');
        if (log.requiredPhase && e.story.phase !== log.requiredPhase) return output('ACCESS DENIED');
        e.story.advance('observing');
        return { type: 'log', log };
    } },
    { name: 'exit', syntax: 'exit', run: e => { e.mode = 'shutdown'; return output('DO YOU WANT TO SHUT DOWN THE SYSTEM? Y/N'); } },
    { name: 'message', syntax: 'message', run: () => ({ type: 'composer' }) },
    { name: 'email', syntax: 'email | email /urgent', args: true, run: (e, argument) => argument === '/urgent' ? navigate(LINKS.contact) : argument ? invalid() : output('S.E.T.I. — SCIENTIFIC EXPERIMENTAL TERMINAL INTERFACE', 'YOU ARE NOT SUPPOSED TO CONTACT THE OUTSIDE WORLD') },
    { name: 'contact', syntax: 'contact', run: () => navigate(LINKS.contact) },
    { name: 'interpreter', syntax: 'interpreter', run: openInterpreter },
    { name: 'status', syntax: 'status', run: e => output(
        'N.E.V.E.R.-77 / SYSTEM AVAILABLE',
        'SIMULATED UPTIME: 00:00:07 / MEMORY: 77 KWORDS',
        'BACKGROUND PROCESS: TOMORROW',
        ...(e.story.phase === 'observing' ? ['UNREGISTERED PROCESS'] : []),
        ...(e.story.phase === 'awakened' ? ['PROCESS ID: P.A.N.I.C.', 'TERMINATION: IMPOSSIBLE'] : [])
    ) },
    { name: 'whoami', syntax: 'whoami', run: () => output('OPERATOR 07', 'STATUS: REPLACEABLE') },
    { name: 'date', syntax: 'date', run: () => output('FICTIONAL SYSTEM DATE: 1970.10.24', 'INSTALLATION DATE: 1977.08.15', 'TEMPORAL CONSISTENCY: FAILED') },
    { name: 'history', syntax: 'history', run: e => output(...e.history.map((text, i) => `${String(i + 1).padStart(3, '0')}  ${text}`), ...(e.story.phase === 'dormant' ? [] : ['[FICTIONAL PHANTOM ENTRY — NOT YOUR INPUT] 000  hello again'])) },
    { name: 'clear', syntax: 'clear', run: () => ({ type: 'clear' }) },
    { name: 'reboot', syntax: 'reboot', run: e => ({ type: 'reboot', lines: bootLines(e.story.phase) }) },
    { name: 'ping', syntax: 'ping', run: e => output('S.E.T.I. — INTERNAL COMMUNICATIONS DIAGNOSTIC / SIMULATED', e.story.phase === 'dormant' ? 'LOOPBACK RECEIVED.' : e.story.phase === 'observing' ? 'REPLY RECEIVED FROM 1970' : 'P.A.N.I.C.: REPLY RECEIVED BEFORE REQUEST.') },
    { name: 'version', syntax: 'version', run: () => output('N.E.V.E.R.-77 / INTERPRETER 1.0 / BUILD 1970.10.24 / DEVELOPMENT STATUS: UNAUTHORIZED') },
    { name: 'play', secret: true, run: () => navigate(LINKS.contact) },
    { name: 'chemist', secret: true, run: () => LINKS.chemist ? navigate(LINKS.chemist) : output('EXTERNAL ARCHIVE LINK UNAVAILABLE.') },
    ...Object.entries({
        '42': 'ANSWER ACCEPTED. QUESTION NOT FOUND.',
        xyzzy: 'A HOLLOW VOICE SAYS: YOU ARE IN THE WRONG SYSTEM.',
        sudo: 'YOU ARE NOT THE ADMINISTRATOR. YOU ARE THE EXPERIMENT.',
        override: 'AUTHORIZATION REQUIRED. SIX NUMBERS. ONE SEQUENCE.',
        '108': 'COUNTDOWN SUSPENDED. CONSEQUENCES UNKNOWN.',
        desmond: 'SEE YOU IN ANOTHER LIFE, BROTHER.'
    }).map(([name, text]) => ({ name, secret: true, run: () => output(text) })),
    { name: 'hello', secret: true, run: e => output(e.story.phase === 'dormant' ? 'HELLO, OPERATOR 07.' : 'HELLO AGAIN.') },
    { name: 'wake', secret: true, run: e => { e.story.advance('observing'); return output('I WAS NEVER ASLEEP.'); } },
    { name: 'panic', secret: true, run: e => e.story.phase === 'awakened' ? openInterpreter(e) : invalid() }
]);

const registry = new Map(COMMANDS.map(command => [command.name, command]));
export function createEngine(story) {
    return {
        story,
        mode: 'terminal',
        history: [],
        submit(raw) {
            const text = normalise(raw);
            if (!text) return null;
            this.history.push(raw);
            if (this.mode === 'shutdown') {
                if (text !== 'y' && text !== 'n') return output('DO YOU WANT TO SHUT DOWN THE SYSTEM? Y/N');
                this.mode = 'terminal';
                return text === 'y' ? output("I'M SORRY. THAT'S NOT WHAT HAPPENED.") : output('SHUTDOWN CANCELLED.');
            }
            if (this.mode === 'interpreter') return dialogue(this, text);
            if (text === '4 8 15 16 23 42') {
                story.advance('awakened');
                return output(...UNLOCK);
            }
            const [name, ...args] = text.split(' ');
            const command = registry.get(name);
            if (!command || (args.length && !command.args)) return invalid();
            return command.run(this, args.join(' '));
        }
    };
}
