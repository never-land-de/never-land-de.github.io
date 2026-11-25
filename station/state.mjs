export const STORAGE_KEY = 'project-tomorrow:story:v1';
export const PHASES = ['dormant', 'observing', 'awakened'];

// Store only the story phase. Commands, dialogue and composer data stay in memory.
export function createStory(storage) {
    let phase = 'dormant';
    try {
        const saved = storage?.getItem(STORAGE_KEY);
        if (PHASES.includes(saved)) phase = saved;
    } catch { /* Storage can be unavailable; the visit still works. */ }
    return {
        get phase() { return phase; },
        advance(next) {
            if (PHASES.indexOf(next) > PHASES.indexOf(phase)) {
                phase = next;
                try { storage?.setItem(STORAGE_KEY, phase); } catch { /* In-memory fallback. */ }
            }
        }
    };
}
