# Machine Memory — Windows era media update v1.2

Incremental update, 14 November 2026. Page: `/tech/machine-memory.html`. No commit, merge, push or deployment.

## Sources and conversions

The exact Vista filename is **`windowsvista_home_premium_upgrade.HEIC`**. All four sources are locally available HEIC files, not iCloud placeholders. All have Display P3 source profiles. The original dimensions below are encoded pixel dimensions; Windows 98 has EXIF orientation 6 (3024×4032 upright), while the other three have orientation 1.

| Exact source in `docs/machine-memory-assets/` | Original dimensions | Original bytes | PNG in `essentials/tech/machine-memory/` | Output dimensions | PNG bytes | Status |
| --- | --- | ---: | --- | --- | ---: | --- |
| `windows98.HEIC` | 4032×3024 | 1,575,074 | `windows-98.png` | 1000×1333 | 2,279,493 | Converted |
| `windowsvista_home_premium_upgrade.HEIC` | 5712×4284 | 2,823,910 | `windows-vista-upgrade.png` | 1000×750 | 1,059,094 | Converted |
| `windowsxp_ssl_de.HEIC` | 5712×4284 | 3,068,680 | `windows-xp-01.png` | 1200×900 | 1,726,546 | Converted |
| `windowsxp_ssl_de_2.HEIC` | 5712×4284 | 3,538,927 | `windows-xp-02.png` | 1000×750 | 1,205,927 | Converted |

Used the existing native macOS Core Image decoder and lossless PNG optimizer. EXIF orientation is baked into pixels; images are proportionally downsampled without upscaling and exported in 8-bit sRGB. Lossless IDAT recompression retains the smallest original/default/filtered zlib stream and verifies decoded scanline equality. Public PNGs contain structural chunks and a compact sRGB marker; GPS, EXIF, ICC profiles and text metadata are removed. No lossy palette reduction, sharpening, artistic filters or new dependencies were introduced.

The portrait Windows 98 image is 2.28 MB, larger than its HEIC original; lossless PNG retains the small disc lettering and reflective detail. All outputs are at or below the 1200px width limit. Originals and all 12 existing public PNGs remain byte-for-byte unchanged. Existing assets were not reprocessed.

## Editorial placement

- **Vobis Pentium II, 1998:** Windows 98 joins the existing Internet Explorer 4 artifact in a restrained two-image group. The IE image, alt text and caption are unchanged.
- **AMD Athlon XP 2400+, circa 2002–2004:** both XP photographs are used. The primary view shows the blue Professional Version 2002 package; the second shows the orange interior and installation disc. These provide different visual information rather than duplicate imagery.
- **Intel Core 2 Duo, circa 2007:** a single supporting Vista photograph shows Home Premium upgrade packaging. Its caption explicitly separates the photographed edition from the unrecorded installed edition. Chieftec Dragon CS-601, ASRock 4CoreDual-VSTA and the unknown graphics card remain unchanged.

No image or caption claims that these software artifacts were bundled with the corresponding computer. All approved narrative, dates, machine names, specifications, headings and anchors are unchanged.

| New PNG | Caption | Alt text |
| --- | --- | --- |
| `windows-98.png` | Windows 98 — the operating system of my first proper internet years. | A Microsoft Windows 98 CD in an open jewel case, with German disc text and a security-update CD sleeve behind it. |
| `windows-xp-01.png` | Windows XP — the operating system of my first self-built PC. | The blue cover of a Microsoft Windows XP Professional Version 2002 package, lying beside a mouse and a laptop keyboard. |
| `windows-xp-02.png` | Inside the Windows XP Professional package. | An open Windows XP Professional package with an orange interior, German feature descriptions and a holographic installation CD. |
| `windows-vista-upgrade.png` | Windows Vista Home Premium upgrade packaging. The PC’s installed edition is not recorded. | An open Windows Vista Home Premium upgrade package with a green cover and a holographic DVD visible inside. |

## Implementation and verification

- Updated `tech/machine-memory.html` with four semantic figures, real exported dimensions, English alt text/captions, lazy loading and async decoding.
- Updated only scoped `css/machine-memory.css`: a small `mm-image-pair` wrapper reuses the existing figure treatment and 700px breakpoint. Two columns on desktop/tablet become one on mobile; full images retain their aspect ratios. Existing layout, fonts, colors, asymmetric corners, cover, header and footer remain intact.
- Added reviewed source mappings and an optional `--only` argument to `tools/convert-machine-memory.py`, allowing incremental conversions without rewriting earlier assets. The native Swift helper was unchanged.
- **Real Chrome QA:** six check groups passed at **1440×1000, 768×1024, 390×844 and 320×568**. Inspected screenshots of the desktop groups, tablet group and mobile/narrow layouts. No horizontal overflow, clipped dates, rail/caption collisions, forced cropping, broken image references, browser errors or external requests.
- Verified all 13 page images load, all 21 entries and seven sections remain present, original image markup and captions remain identical, and all new photographs use native lazy loading. JavaScript-disabled rendering, reduced motion and TECH teaser navigation passed.
- Static verification passed for balanced HTML, local paths, real image dimensions, PNG checksums, nonblank image data, sRGB markers and stripped metadata. Source hashes, previous public asset hashes and all unrelated file hashes match the pre-task baseline. `git diff --check` passed.

QA evidence: [Windows 98 + IE desktop](machine-memory/windows-era/windows-0-1440.png), [XP desktop](machine-memory/windows-era/windows-1-1440.png), [tablet](machine-memory/windows-era/windows-0-768.png), [XP mobile](machine-memory/windows-era/windows-1-390.png), [Vista mobile](machine-memory/windows-era/windows-2-390.png), [320px](machine-memory/windows-era/windows-0-320.png). Machine-readable conversion details and browser results are alongside those screenshots.

**Unresolved issues:** none for these four files. No conversions were blocked or omitted. Browser testing used Chrome.

## Repeat only this conversion

From the repository root on macOS:

```sh
python3 tools/convert-machine-memory.py --only windows98.HEIC windowsvista_home_premium_upgrade.HEIC windowsxp_ssl_de.HEIC windowsxp_ssl_de_2.HEIC --manifest /private/tmp/machine-memory-windows-conversion.json
```

The converter reads `docs/` without writing to it. In Codex, native HEIC decoding uses the approved execution permission. Captions and alt text remain directly editable in the HTML.
