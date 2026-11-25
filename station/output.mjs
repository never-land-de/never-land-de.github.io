// Timing is centralised here; command execution and pagination stay synchronous.
export const OUTPUT_TIMING = Object.freeze({
    clearPause: 55,
    shortLimit: 420,
    shortSteps: 48,
    shortTick: 14,
    longSteps: 32,
    longChunk: 96,
    longTick: 12
});

function wait(signal, schedule, cancel) {
    return new Promise(resolve => {
        if (signal.aborted) { resolve(false); return; }
        const finish = value => { signal.removeEventListener('abort', abort); resolve(value); };
        const id = schedule(() => finish(true));
        const abort = () => { cancel(id); finish(false); };
        signal.addEventListener('abort', abort, { once: true });
    });
}
const frame = signal => wait(signal, requestAnimationFrame, cancelAnimationFrame);
const pause = (ms, signal) => wait(signal, fn => setTimeout(fn, ms), clearTimeout);

export function createOutputRenderer({ output, element, onBusyChange }) {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let controller;
    let busy = false;
    let focusRequested = false;

    function stop() {
        controller?.abort();
        output.querySelector('.output-writing')?.classList.remove('output-writing');
    }
    function setBusy(value) {
        busy = value;
        onBusyChange(value, { focus: focusRequested });
    }

    return {
        get busy() { return busy; },
        get focusRequested() { return focusRequested; },
        // Passive layout changes must not dismiss/reopen a software keyboard.
        replace(blocks) {
            output.replaceChildren(...blocks.map(element));
        },
        async render(blocks, { focus = true } = {}) {
            stop();
            controller = new AbortController();
            const { signal } = controller;
            focusRequested = focus;
            output.replaceChildren();
            if (!blocks.length) { setBusy(false); return true; }
            setBusy(true);
            // Two frames guarantee a painted empty screen, including Reduced Motion.
            if (!await frame(signal) || !await frame(signal)) return false;
            if (!motion.matches && !await pause(OUTPUT_TIMING.clearPause, signal)) return false;

            const records = blocks.map(block => {
                const node = element(block);
                const target = node.querySelector('a') || node;
                const characters = Array.from(target.textContent);
                target.textContent = '';
                return { node, target, characters, position: 0 };
            });
            const total = records.reduce((sum, record) => sum + record.characters.length, 0);
            const short = total <= OUTPUT_TIMING.shortLimit;
            const chunk = short ? Math.max(1, Math.ceil(total / OUTPUT_TIMING.shortSteps))
                : Math.max(OUTPUT_TIMING.longChunk, Math.ceil(total / OUTPUT_TIMING.longSteps));
            let index = 0;
            let cursor;
            while (index < records.length) {
                let remaining = motion.matches ? Infinity : chunk;
                while (remaining > 0 && index < records.length) {
                    const record = records[index];
                    if (!record.node.isConnected) output.append(record.node);
                    cursor?.classList.remove('output-writing');
                    cursor = record.node;
                    if (!motion.matches) cursor.classList.add('output-writing');
                    const count = Math.min(remaining, record.characters.length - record.position);
                    record.position += count;
                    record.target.textContent = record.characters.slice(0, record.position).join('');
                    remaining -= count;
                    if (record.position === record.characters.length) index++;
                }
                if (index < records.length && !await pause(short ? OUTPUT_TIMING.shortTick : OUTPUT_TIMING.longTick, signal)) return false;
            }
            cursor?.classList.remove('output-writing');
            if (signal.aborted) return false;
            setBusy(false);
            return true;
        }
    };
}
