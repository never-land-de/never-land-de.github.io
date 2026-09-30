(() => {
    "use strict";

    const root = document.getElementById("memory-alpha");
    if (!root) return;

    const ui = {
        label: document.getElementById("memory-alpha-label"),
        main: document.getElementById("memory-alpha-main"),
        byline: document.getElementById("memory-alpha-byline"),
        meta: document.getElementById("memory-alpha-meta"),
        comment: document.getElementById("memory-alpha-comment"),
        counter: document.getElementById("memory-alpha-counter"),
        open: document.getElementById("memory-alpha-open"),
        next: document.getElementById("memory-alpha-next")
    };

    const TYPE_LABELS = {
        album: "ALBUM",
        track: "TRACK",
        game: "GAME",
        tech: "TECH",
        quote: "QUOTE",
        memory: "MEMORY",
        gig: "GIG"
    };

    const state = {
        randomPool: [],
        onThisDayPool: [],
        currentId: null,
        displayCount: 0
    };

    function asArray(payload, preferredKey) {
        if (Array.isArray(payload)) return payload;
        if (payload && Array.isArray(payload[preferredKey])) return payload[preferredKey];
        if (payload && Array.isArray(payload.items)) return payload.items;
        return [];
    }

    function cleanText(value) {
        return value == null ? "" : String(value).trim();
    }

    function parseBoolean(value, fallback = false) {
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
            const normal = value.trim().toLowerCase();
            if (["true", "yes", "1", "x"].includes(normal)) return true;
            if (["false", "no", "0", ""].includes(normal)) return false;
        }
        return fallback;
    }

    function createLocalDate(year, month, day) {
        const date = new Date(year, month - 1, day);
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) return null;
        return date;
    }

    function parseDate(value) {
        if (!value) return null;

        if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;

        const text = cleanText(value);
        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return null;

        return createLocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
    }

    function parseGigDate(gig) {
        const direct = parseDate(gig.date);
        if (direct) return direct;

        const year = Number(gig.year);
        const day = Number(gig.day);
        if (!year || !day) return null;

        const monthValue = gig.month;
        let month = Number(monthValue);
        if (!month || month > 12) {
            const key = cleanText(monthValue).toLowerCase().replace(".", "");
            const monthNames = {
                jan: 1, january: 1,
                feb: 2, february: 2,
                mar: 3, march: 3,
                apr: 4, april: 4,
                may: 5,
                jun: 6, june: 6,
                jul: 7, july: 7,
                aug: 8, august: 8,
                sep: 9, sept: 9, september: 9,
                oct: 10, october: 10,
                nov: 11, november: 11,
                dec: 12, december: 12
            };
            month = monthNames[key];
        }

        if (!month) return null;
        return createLocalDate(year, month, day);
    }

    function isPastSameDay(date, today) {
        return Boolean(
            date &&
            date < today &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    }

    function normaliseMemory(item, index) {
        const type = cleanText(item.type).toLowerCase() || "memory";
        const date = parseDate(item.date);

        return {
            id: cleanText(item.id) || `memory-${index + 1}`,
            type,
            title: cleanText(item.title),
            byline: cleanText(item.byline),
            meta: cleanText(item.meta),
            date,
            comment: cleanText(item.comment),
            link: cleanText(item.link),
            enabled: item.enabled === true,
            random: item.random === true,
            onThisDay: item.on_this_day === true
        };
    }

    function normaliseGig(gig, index) {
        const date = parseGigDate(gig);
        const artist = cleanText(gig.artist || gig.band || gig.bands);
        const city = cleanText(gig.city);
        const venue = cleanText(gig.venue);
        const metaParts = [city, venue].filter(Boolean);

        return {
            id: cleanText(gig.id) || `gig-${index + 1}`,
            type: "gig",
            title: artist || "LIVE",
            byline: metaParts.join(" // "),
            meta: date ? String(date.getFullYear()) : "",
            date,
            comment: cleanText(gig.comment),
            link: cleanText(gig.link || gig.url),
            enabled: gig.enabled === undefined ? true : parseBoolean(gig.enabled, true),
            random: false,
            onThisDay: true
        };
    }

    function pickRandom(items) {
        if (!items.length) return null;
        const withoutCurrent = items.filter(item => item.id !== state.currentId);
        const pool = withoutCurrent.length ? withoutCurrent : items;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function formatCounter() {
        const total = new Set([...state.randomPool, ...state.onThisDayPool]).size;
        if (!total) return "";
        const n = String(((state.displayCount - 1) % total) + 1).padStart(3, "0");
        return `RECORD ${n} / ${String(total).padStart(3, "0")}`;
    }

    function labelFor(item, isOnThisDay) {
        const typeLabel = TYPE_LABELS[item.type] || item.type.toUpperCase();
        if (!isOnThisDay) return typeLabel;
        return item.date ? `ON THIS DAY // ${item.date.getFullYear()} // ${typeLabel}` : `ON THIS DAY // ${typeLabel}`;
    }

    function render(item, isOnThisDay = false) {
        if (!item) return;

        state.currentId = item.id;
        state.displayCount += 1;

        ui.label.textContent = labelFor(item, isOnThisDay);
        ui.main.textContent = item.title || "UNTITLED RECORD";
        ui.byline.textContent = item.byline;
        ui.meta.textContent = item.meta;
        ui.comment.textContent = item.comment;
        ui.counter.textContent = formatCounter();

        if (item.link) {
            ui.open.href = item.link;
            ui.open.hidden = false;
        } else {
            ui.open.removeAttribute("href");
            ui.open.hidden = true;
        }

        root.hidden = false;
    }

    function renderNext() {
        const next = pickRandom(state.randomPool);
        render(next, false);
    }

    async function fetchJson(url) {
        if (!url) return null;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
        return response.json();
    }

    async function init() {
        const memoryUrl = root.dataset.memorySrc;
        const gigsUrl = root.dataset.gigsSrc;
        const [memoryResult, gigsResult] = await Promise.allSettled([
            fetchJson(memoryUrl),
            fetchJson(gigsUrl)
        ]);

        const memoryPayload = memoryResult.status === "fulfilled" ? memoryResult.value : null;
        const gigsPayload = gigsResult.status === "fulfilled" ? gigsResult.value : null;

        const memories = asArray(memoryPayload, "items")
            .map(normaliseMemory)
            .filter(item => item.enabled && item.title && Object.hasOwn(TYPE_LABELS, item.type) && item.type !== "gig");

        const gigs = asArray(gigsPayload, "gigs")
            .map(normaliseGig)
            .filter(item => item.enabled && item.title && item.date);

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        state.onThisDayPool = [
            ...memories.filter(item => item.onThisDay && isPastSameDay(item.date, today)),
            ...gigs.filter(item => isPastSameDay(item.date, today))
        ];

        state.randomPool = memories.filter(item => item.random);

        const first = state.onThisDayPool.length
            ? pickRandom(state.onThisDayPool)
            : pickRandom(state.randomPool);

        if (!first) return;
        render(first, state.onThisDayPool.includes(first));

        ui.next.addEventListener("click", renderNext);
    }

    init().catch(() => {
        // Fail closed: if both data sources are unavailable, the homepage keeps its normal layout.
        root.hidden = true;
    });
})();
