# Machine Memory — media integration v1.1

Implemented locally on 14 November 2026. Page: `/tech/machine-memory.html`. No commit, merge, push or deployment. This report supersedes the original cover-placeholder instructions in `machine-memory-acceptance.md`.

## A. Source inventory

Case-sensitive inventory of `docs/machine-memory-assets/`. Sizes are bytes; dimensions are encoded source dimensions before EXIF rotation. All original files, including metadata, remain byte-for-byte unchanged.

| Original filename | Format | Dimensions | Original bytes |
| --- | --- | --- | ---: |
| `machine_archives_cover.png` | PNG | 1448×1086 | 2,994,324 |
| `imacg3_2000.HEIC` | HEIC | 4032×3024 | 2,654,492 |
| `imac_g3_2000.HEIC` | HEIC | 4032×3024 | 1,748,107 |
| `internet_explorer_4_cd.HEIC` | HEIC | 4032×3024 | 1,898,347 |
| `ibook_g4.heic` | HEIC | 3814×2860 | 1,596,448 |
| `ibook_g4_2.DNG` | DNG | 4032×3024 | 27,325,827 |
| `ibook_g4_hdd_install.HEIC` | HEIC | 4032×3024 | 2,201,590 |
| `macbook_pro_2015_windows11.jpg` | JPG | 1433×806 | 520,972 |
| `battlestation_lights.HEIC` | HEIC | 4032×3024 | 847,137 |
| `compaq_mini_311.HEIC` | HEIC | 4032×3024 | 1,477,508 |
| `.DS_Store` | macOS folder metadata | — | 6,148 |

**Missing:** `IMG_5361.HEIC` and `IMG_0433.HEIC` are not in the supplied directory. Neither was guessed, replaced or assigned. There are no additional image files. `.DS_Store` was inventoried and excluded from publication.

## B. Conversion results

All outputs are in `essentials/tech/machine-memory/`. All 10 available source images converted successfully; the two responsive cover derivatives bring the total to **12 PNGs**. Every table row below completed successfully.

| Source | PNG output | Dimensions | PNG bytes | Output/original |
| --- | --- | --- | ---: | ---: |
| `machine_archives_cover.png` | `cover.png` | 1448×1086 | 2,875,974 | 96.05% |
| `machine_archives_cover.png` | `cover-480.png` | 480×360 | 371,010 | 12.39% |
| `machine_archives_cover.png` | `cover-960.png` | 960×720 | 1,341,422 | 44.80% |
| `imacg3_2000.HEIC` | `imac-g3-01.png` | 1200×900 | 1,755,595 | 66.14% |
| `imac_g3_2000.HEIC` | `imac-g3-02.png` | 900×675 | 904,085 | 51.72% |
| `internet_explorer_4_cd.HEIC` | `internet-explorer-4-cd.png` | 1000×750 | 1,342,151 | 70.70% |
| `ibook_g4.heic` | `ibook-g4.png` | 1200×900 | 1,570,827 | 98.40% |
| `ibook_g4_2.DNG` | `ibook-g4-02.png` | 1000×750 | 1,023,898 | 3.75% |
| `ibook_g4_hdd_install.HEIC` | `ibook-g4-hdd-install.png` | 1000×750 | 1,277,066 | 58.01% |
| `macbook_pro_2015_windows11.jpg` | `macbook-pro-2015-windows11.png` | 1200×675 | 1,586,787 | 304.58% |
| `battlestation_lights.HEIC` | `battlestation.png` | 800×1067 | 901,076 | 106.37% |
| `compaq_mini_311.HEIC` | `compaq-mini-311.png` | 900×675 | 995,775 | 67.40% |

**Method for every output:** Apple Core Image decoding, recorded EXIF orientation baked into pixels, proportional downsampling only, 8-bit sRGB conversion, then lossless PNG IDAT recompression using the smallest retained/default/filtered zlib stream. Decoded scanline bytes are checked for equality during optimization. Alpha is preserved. Only PNG structural data and a compact sRGB marker remain: no EXIF, GPS, ICC profile, timestamps or text metadata. No palette reduction, sharpening or artistic filters were applied.

**DNG:** Apple `CIRAWFilter`, decoder `8.dng`, draft mode off, scale factor 1. The developed raster was verified at **4032×3024**, matching native RAW dimensions, before resizing to 1000×750. This is genuine RAW development, not extraction of an embedded preview. RAW sharpening, detail enhancement and added contrast were disabled.

**Orientation:** the Battlestation source has orientation 6 and is exported upright at 800×1067; the Compaq and DNG sources have orientation 3, also baked into the exported pixels. The other sources have orientation 1. Rounding to whole output pixels accounts for sub-pixel aspect-ratio differences.

**File-size exceptions:** lossless photography PNGs range from 0.90–1.76 MB. The main iMac, iBook, Internet Explorer artifact, maintenance photo, MacBook and DNG alternate exceed roughly 1 MB. The detailed cover is 2.88 MB; the 960px derivative is 1.34 MB. These sizes preserve screen lettering, logos and hardware detail. PNG can exceed the compressed HEIC/JPEG original size, as the table shows. The mobile cover is 0.37 MB, and every timeline photograph is lazy-loaded.

## C. Editorial mapping

The approved timeline text, dates, machine specifications, Chieftec identification, headings and stable anchors are unchanged. Only photographs, alt text and captions were added. The title remains a semantic H1 beneath the cover; the author’s artwork contains hardware lettering but no duplicated editorial title. The cover uses its full 4:3 proportions without cropping.

| PNG | Entry / role | Caption | Alt text |
| --- | --- | --- | --- |
| `cover.png` (plus 480/960 variants) | Hero / primary artwork | — | Pixel-art view inside a desktop PC, with a motherboard, graphics card fans and purple, blue and amber lighting. |
| `internet-explorer-4-cd.png` | 1998 — The Vobis Pentium II / secondary artifact | An Internet Explorer 4.0 disc from the early web era. | A hand holding a Microsoft Internet Explorer 4.0 CD case, with a German promotional cover mentioning Windows 98. |
| `imac-g3-01.png` | c. 2005 — Apple iMac G3 / primary | The iMac G3, revisiting the early web. | An iMac G3 displaying Jan’s revived homepage in Safari, with a black keyboard in the foreground. |
| `imac-g3-02.png` | c. 2005 — Apple iMac G3 / secondary desktop view | Another view of the iMac G3 desktop. | An iMac G3 on a desk beside a window, showing a blue Mac OS X desktop and Dock. |
| `macbook-pro-2015-windows11.png` | MacBook Pro 15-inch, 2015 / primary | The 2015 MacBook Pro, running Windows 11. | A MacBook Pro showing the Windows 11 About Windows dialog over a bamboo forest wallpaper. |
| `battlestation.png` | The Battlestation / primary | The Battlestation, under blue light. | The Battlestation tower seen through its side panel, with blue lighting around the CPU cooler and graphics card. |
| `ibook-g4.png` | Machines in Orbit — iBook G4 / primary | The iBook G4, with a familiar homepage and QuickTime. | A white iBook G4 on a wooden desk beside a plant, displaying Jan’s homepage and a QuickTime video window. |
| `ibook-g4-hdd-install.png` | Machines in Orbit — iBook G4 / secondary maintenance context | Inside the iBook G4 during drive installation. | An open iBook G4 with the keyboard and upper case removed, exposing the drive, memory and ribbon cables while a screwdriver is in use. |
| `compaq-mini-311.png` | Machines in Orbit — Compaq Mini 311 / secondary detail | A close-up of the Compaq Mini 311. | Close-up of a Compaq Mini palm rest with Intel Atom, NVIDIA ION and Windows 7 stickers. |

The Internet Explorer disc is presented as an internet-era artifact; the caption makes no claim that it came with the Vobis system. The iMac filenames containing “2000” do not change its circa 2005 acquisition date. The maintenance photo is captioned only as drive installation, without inventing specifications or additional repair history.

## D. Unassigned and missing assets

- `ibook_g4_2.DNG` → `ibook-g4-02.png`: fully developed, converted and available, but not referenced in HTML. It shows an alternate angle of the same iBook setup. The overall front view and open-machine photograph supply stronger, distinct editorial context without creating an image wall. No caption or alt text is used for this unassigned export.
- `IMG_5361.HEIC`, `IMG_0433.HEIC`: absent. To integrate these later, supply the files, inspect their subjects, add descriptive reviewed output mappings to the conversion script, then add figures only where supported by the existing history.
- `.DS_Store`: unrelated folder metadata; not converted or published.

## E. Quality assurance

- Visually inspected all available images via native-decoded previews, the full RAW development and a browser contact sheet of all 12 final PNGs. Natural colors, screen lettering and orientation are retained. No source artwork was regenerated.
- Real Chrome browser checks passed at **1440×1000, 768×1024, 390×844 and 320×568**: proportional hero, all eight photographs and captions, readable dates, clear timeline rail, no horizontal overflow or image/date collision.
- All nine HTML images load successfully with real dimensions and meaningful alt text. Every photograph uses native lazy loading and async decoding. The cover loads eagerly with high priority and responsive PNG sources. Explicit dimensions reserve space before loading. No broken media, browser errors or external requests were recorded.
- Existing TECH teaser, breadcrumb and shared mobile navigation work. All 21 entry and seven section anchors remain clear of the sticky header. One H1 is retained, and heading order is unchanged.
- JavaScript-disabled narrative and photographs, reduced motion, actual Tab-key focus and Escape-to-close navigation passed. Existing readable text colors and visible focus styling remain unchanged.
- Static checks verified original hashes, unchanged approved text and IDs, correct image dimensions, valid PNG checksums, nonblank raster data, sRGB markers and absence of EXIF/GPS/profile metadata. No HEIC, DNG, JPEG or WebP is referenced by page image markup.
- Existing checks: `node --test tests/station.test.mjs` — **13 passed**; `python3 tests/station_links.py` — **3 passed**; `git diff --check` passed.
- Every previously existing file except the intended HTML and scoped CSS is unchanged. The TECH landing page and shared styles/scripts were not modified. All source images are unchanged. No dependencies were installed.

Browser evidence: [desktop cover](machine-memory/media/media-hero-1440.png), [tablet cover](machine-memory/media/media-hero-768.png), [mobile cover](machine-memory/media/media-hero-390.png), [320px cover](machine-memory/media/media-hero-320.png), [all PNG exports](machine-memory/media/media-contact-sheet.png). Machine-readable results: `machine-memory/media/browser-results.json`; conversion inventory, source hashes and results: `machine-memory/media-conversion.json`.

**Limits:** Safari and Firefox were not tested. Two expected generic source files remain missing. The larger lossless PNG sizes and the deliberately unassigned DNG alternate are documented above; there are no known broken media or layout issues.

## F. Editorial maintenance

- **Regenerate:** run `python3 tools/convert-machine-memory.py` on macOS with the installed Apple Swift command-line tools. The helper `tools/machine-memory-image.swift` handles native decoding and RAW development. Python performs lossless PNG optimization and inventories extra/missing files. Add `--manifest /private/tmp/machine-memory-conversion.json` for a fresh JSON log. The converter treats all of `docs/` as read-only; the supplied manifest is the initial integration record. Originals are never moved or overwritten. In a restricted Codex sandbox, native HEIC/RAW decoding needs its approved macOS execution permission; blank decoding is rejected by the script.
- **Replace a photograph:** replace or add the approved source under `docs/machine-memory-assets/`, update its case-sensitive mapping in the script if needed, and regenerate. Match the HTML width/height to the exported dimensions. Edit the figure’s alt text and caption if its subject changes.
- **Add an image:** add a reviewed filename/output/maximum-width mapping in the Python script, regenerate, then copy the documented `figure.mm-machine-image` template into the relevant entry. Use a local `.png`, actual dimensions, descriptive alt text, `loading="lazy"` and `decoding="async"`. Optional `mm-machine-image--secondary` and `--portrait` classes limit display width.
- **Edit captions:** change the appropriate `<figcaption>` directly in `tech/machine-memory.html`. Editorial paragraphs remain independent of image processing.
- **Replace the cover:** update `machine_archives_cover.png` in the source folder and regenerate. Keep `cover.png`, `cover-480.png` and `cover-960.png` synchronized. If dimensions change, update the hero’s width/height, srcset width descriptors and alt text; omit any variant larger than the original. No runtime loader is involved.

## Changed and created files

- Changed: `tech/machine-memory.html`, `css/machine-memory.css`.
- Created: 12 PNG assets under `essentials/tech/machine-memory/`; the two conversion utilities under `tools/`; `docs/machine-memory/media-conversion.json`; media QA screenshots/results under `docs/machine-memory/media/`; this report.
