# Machine Memory — implementation and QA

Implemented locally on 14 November 2026. No commit, merge, push or deployment.

## Files and URL

- `tech/machine-memory.html`: complete static editorial page, shared site header/footer, breadcrumb, era navigation, continuous timeline rail and conclusion.
- `css/machine-memory.css`: scoped page styles and the TECH feature teaser. Shared stylesheets are unchanged.
- `tech/index.html`: added the stylesheet and the prominent teaser before the existing Windows XP and iMac features. Its pre-existing terminal link and stylesheet are preserved.
- `docs/machine-memory-acceptance.md`: this report.
- `docs/machine-memory/`: Chrome screenshots and concise `qa-results.json`.

Final path: **`/tech/machine-memory.html`**.

Local preview: `http://127.0.0.1:8765/tech/machine-memory.html` after starting `python3 -m http.server 8765 --bind 127.0.0.1` from the repository root. The verification server was stopped after QA.

## Content and editing

All seven sections and 21 timeline entries are present, including the Radeon component, both Core 2 Duo appearances, and all six machines within Machines in Orbit. The approved hero introduction, introductory paragraphs, technical metadata, dates, uncertainty and complete conclusion are retained. Final editorial line: `TO BE CONTINUED_`.

Content is ordinary semantic HTML, available without JavaScript. Dates, prose, specifications and statuses can be edited directly. Each entry has a stable, descriptive anchor. A `REUSABLE TIMELINE ENTRY` source comment explains copying an entry and inserting an optional responsive, lazy-loaded image with explicit dimensions. No machine-image placeholders are shown to readers.

The first four eras use muted green/beige, blue, neutral silver and amber accents. Parallel Lives has round rail markers; Lost Devices has subdued dashed frames. Only the missing Core 2 Duo carries `SYSTEM NOT FOUND`.

## Cover integration

Reserved asset: **`/essentials/tech/machine-memory/cover.webp`**. No cover image was generated, downloaded or added.

After supplying that file, uncomment the single `<img class="mm-cover__image" ...>` element in the page's `COVER ART` source comment. This is the only activation change. CSS automatically hides the placeholder. The 16:9 container remains the same size; `object-fit: contain` preserves the original artwork's proportions. Set the image dimensions to those of the supplied file and add descriptive alt text if the artwork conveys information beyond the page title. The title and introduction sit below the artwork, keeping text readable without an overlay.

## Verification

- **Real Chrome review:** screenshots captured and visually inspected at 1440×1000, 768×1024, 390×844 and 320×568. [Desktop timeline](machine-memory/timeline-1440.webp), [tablet timeline](machine-memory/timeline-768.webp), [mobile timeline](machine-memory/timeline-390.webp), [320px timeline](machine-memory/timeline-320.webp).
- **10 browser check groups passed:** complete paragraph-by-paragraph content comparison; dates and metadata; local resource paths and anchors; all requested viewport sizes; actual era-link navigation; sticky-header offsets; keyboard focus and shared mobile menu; reduced motion; TECH teaser navigation; JavaScript-disabled readability; future-cover activation; browser errors and failed resources.
- **Layout:** no horizontal overflow, clipped dates or date/content overlaps at the four widths. Longer date labels wrap within their own column. All 21 entries and seven section targets clear the sticky header by using a 100px scroll margin. Page-specific instant scrolling avoids inherited Bootstrap smooth scrolling.
- **Cover:** intentional CSS-only placeholder renders at every width, makes no image request, and reserves its dimensions. Inserting an existing local image temporarily through DevTools hid the placeholder with zero cover-height change; the repository contains no temporary cover image.
- **Progressive enhancement:** narrative remains visible with JavaScript disabled. Only the existing shared navigation script is loaded. The cursor animation runs only with `prefers-reduced-motion: no-preference`.
- **Static checks:** balanced HTML nesting, unique IDs, valid local links, matching anchor targets, and existing CSS font/background paths. No external font or image requests. No new dependencies.
- **Existing checks:** `node --test tests/station.test.mjs` — 13 passed; `python3 tests/station_links.py` — 3 passed. `git diff --check` passed.
- **Preservation:** compared pre-task file hashes; every existing file except the intended `tech/index.html` edit is byte-for-byte unchanged. Removing the two Machine Memory additions from that file reproduces its pre-task contents exactly.

## Remaining items and limits

The cover artwork is the only visible editorial placeholder. Approximate dates and missing hardware details remain exactly as approved for later author edits. No deviations from the implementation brief and no known outstanding implementation issues. Browser QA used Chrome; Safari and Firefox were not tested.
