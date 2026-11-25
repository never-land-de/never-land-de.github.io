// Measure with the real font, wrapping width and remaining console height.
// Input remains plain text; only registry links receive anchor elements.
import { createOutputRenderer } from './output.mjs';

export function createPager({ viewport, output, controls, previous, next, indicator, onBusyChange }) {
    const measure = document.createElement('div');
    measure.className = 'pager-measure';
    measure.setAttribute('aria-hidden', 'true');
    measure.inert = true;
    viewport.append(measure);
    let blocks = [];
    let pages = [[]];
    let index = 0;
    let frame;
    let lastSize = '';
    let completion;
    const renderer = createOutputRenderer({
        output, element,
        onBusyChange(busy, options) {
            updateControls(busy);
            onBusyChange(busy, options);
            if (!busy) { const resolve = completion; completion = null; resolve?.(true); }
        }
    });

    function element(block) {
        const paragraph = document.createElement('p');
        paragraph.className = `output-line ${block.className || ''}`;
        if (block.href) {
            const link = document.createElement('a');
            link.href = block.href;
            link.textContent = block.text;
            paragraph.append(link);
        } else {
            paragraph.textContent = block.text || '\u00a0';
        }
        return paragraph;
    }

    function paginate() {
        const style = getComputedStyle(viewport);
        const height = Math.max(1, viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
        if (height < parseFloat(style.lineHeight)) return [blocks];
        measure.style.width = `${Math.max(1, viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight))}px`;
        measure.replaceChildren();
        const result = [[]];
        const current = () => result.at(-1);
        const newPage = () => { result.push([]); measure.replaceChildren(); };
        const fits = () => measure.getBoundingClientRect().height <= height + 0.5;

        for (const block of blocks) {
            if (block.breakBefore && current().length) newPage();
            let remainder = block.text;
            do {
                const node = element({ ...block, text: remainder });
                measure.append(node);
                if (fits()) { current().push({ ...block, text: remainder }); break; }
                // Keep individual list entries together whenever they fit a fresh page.
                if (current().length && node.getBoundingClientRect().height <= height) {
                    node.remove(); newPage(); continue;
                }
                // Split long paragraphs at the largest fitting, Unicode-safe prefix.
                const characters = Array.from(remainder);
                if (block.href || characters.length <= 1) {
                    current().push({ ...block, text: remainder });
                    break; // An extremely short viewport can still scroll this one item.
                }
                let low = 1;
                let high = characters.length;
                let length = 0;
                while (low <= high) {
                    const middle = Math.floor((low + high) / 2);
                    node.textContent = characters.slice(0, middle).join('');
                    if (fits()) { length = middle; low = middle + 1; } else high = middle - 1;
                }
                if (!length && current().length) { node.remove(); newPage(); continue; }
                // Prefer a word/line boundary without discarding any source whitespace.
                length = Math.max(1, length);
                const prefix = characters.slice(0, length).join('');
                const boundary = Math.max(prefix.lastIndexOf('\n'), prefix.lastIndexOf(' '));
                if (boundary > prefix.length / 2) length = Array.from(prefix.slice(0, boundary + 1)).length;
                const part = characters.slice(0, length).join('');
                current().push({ ...block, text: part });
                remainder = characters.slice(length).join('');
                if (!remainder) break;
                newPage();
            } while (true);
        }
        measure.replaceChildren();
        return result;
    }

    function updateControls(busy = renderer.busy) {
        previous.disabled = busy || index === 0;
        next.disabled = busy || index === pages.length - 1;
    }

    function display({ passive = false, focus = true } = {}) {
        const restoreFocus = output.contains(document.activeElement);
        if (passive && !renderer.busy) {
            renderer.replace(pages[index]);
            if (restoreFocus) viewport.focus({ preventScroll: true });
        }
        const pending = passive && !renderer.busy ? Promise.resolve(true)
            : renderer.render(pages[index], { focus: passive ? renderer.focusRequested : focus });
        viewport.scrollTop = 0;
        updateControls();
        const label = `PAGE ${index + 1} / ${pages.length}`;
        if (indicator.textContent !== label) indicator.textContent = label;
        return pending;
    }

    function reflow({ reset = false, focus = true, passive = false } = {}) {
        const anchor = pages.slice(0, index).reduce((count, page) => count + page.reduce((sum, b) => sum + b.text.length, 0), 0);
        controls.hidden = true;
        pages = paginate();
        if (pages.length > 1) {
            controls.hidden = false;
            pages = paginate();
            // If controls leave less than one line, give their space back and scroll.
            if (pages.length === 1) controls.hidden = true;
        }
        index = 0;
        if (!reset) {
            let offset = 0;
            for (let i = 0; i < pages.length; i++) {
                if (offset > anchor) break;
                index = i;
                offset += pages[i].reduce((sum, b) => sum + b.text.length, 0);
            }
        }
        lastSize = `${viewport.clientWidth}:${viewport.clientHeight}`;
        return display({ focus, passive });
    }

    function turn(delta) {
        if (renderer.busy) return false;
        const target = Math.max(0, Math.min(pages.length - 1, index + delta));
        if (target === index) return false;
        index = target;
        display();
        return true;
    }
    previous.addEventListener('click', () => turn(-1));
    next.addEventListener('click', () => turn(1));
    new ResizeObserver(() => {
        if (`${viewport.clientWidth}:${viewport.clientHeight}` === lastSize) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => reflow({ passive: true }));
    }).observe(viewport);
    document.fonts.ready.then(() => reflow({ passive: true }));

    return {
        set(content, options) {
            completion?.(false);
            return new Promise(resolve => {
                completion = resolve;
                blocks = content;
                reflow({ reset: true, ...options });
            });
        },
        turn,
        get busy() { return renderer.busy; },
        get count() { return pages.length; }
    };
}
