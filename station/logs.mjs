export const LINKS = Object.freeze({
    contact: '../options/email.html',
    return: '../tech/index.html',
    // Existing destination in js/email.js; fetched and verified during implementation.
    chemist: 'https://www.thesistersofmercy.com/error404page.html',
    blackwall: null
});

const record = (name, options = {}) => Object.freeze({
    name,
    slug: name.toLowerCase().replaceAll(' ', '-'),
    classification: 'RESTRICTED',
    type: 'archive',
    requiredPhase: null,
    status: 'ARCHIVE FRAGMENT MISSING',
    pages: [],
    link: null,
    ...options
});

export const LOGS = Object.freeze([
    record('Bartmoss Manifest'),
    record('Soulkiller Protocol'),
    record('Blackwall Research', { link: LINKS.blackwall, linkPending: true }),
    record('Tomorrow Accords'),
    record('Panic Maru', {
        type: 'fragment',
        pages: ['A transmission in two parts. The first has already been heard.'],
        link: '../sisters/gigs/2026-brussels-1.html'
    }),
    record('Kobayashi Maru', {
        type: 'fragment',
        pages: ['The second transmission does not repeat the first. Consult the record.'],
        link: '../sisters/gigs/2026-brussels-2.html'
    }),
    record('Netrunner Guide', {
        type: 'fragment',
        pages: ['An interface beyond this interface. Proceed through the archive.'],
        link: '../gaming/cyberpunk2077.html'
    }),
    record('Cynesure Prototypes', { classification: 'CLASSIFIED', status: 'RECORD SEALED' }),
    record('Station Orientation'),
    record('Incident 108', { status: 'RECORD SEALED' }),
    record('Temporal Drift Report'),
    record('Operator Handover'),
    record('Ghost Process'),
    record('Last Transmission'),
    record('Project Looking Glass', { status: 'RECORD SEALED' }),
    record('Avalanche Diagnostic'),
    record('The Black Tape'),
    record('The Final Operator', {
        classification: 'EYES ONLY',
        requiredPhase: 'awakened',
        type: 'record',
        status: 'AVAILABLE',
        pages: ['SUBJECT IDENTIFIED.\nPLEASE DO NOT TURN AROUND.']
    })
]);

export const normalise = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
export function findLog(argument) {
    const name = normalise(argument).replace(/^"([^"]+)"$/, '$1');
    return LOGS.find(log => normalise(log.name) === name || log.slug === name);
}
