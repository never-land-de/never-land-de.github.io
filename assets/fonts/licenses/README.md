# Fonts used by the GTA VI page

All fonts are served from `assets/fonts/`; there are no remote font requests.
The existing shared `home.css` supplies Inter, Geist Mono and Silkscreen.
`gta6.css` adds Space Grotesk. All four families are published under SIL OFL 1.1;
the complete upstream copyright notices and licences are included here.

| Family | Local files | Upstream / licence |
| --- | --- | --- |
| Inter Variable | `InterVariable.woff2` (existing) | https://github.com/rsms/inter / `Inter-OFL.txt` |
| Geist Mono | `GeistMono-Variable.woff2` (existing) | https://github.com/vercel/geist-font / `Geist-OFL.txt` |
| Silkscreen | `Silkscreen-Regular.woff2`, `Silkscreen-Bold.woff2` (existing) | https://github.com/google/fonts/tree/main/ofl/silkscreen / `Silkscreen-OFL.txt` |
| Space Grotesk | `SpaceGrotesk-Variable.woff2` (added, 49,256 bytes) | https://github.com/floriankarsten/space-grotesk / `SpaceGrotesk-OFL.txt` |

Space Grotesk is the upstream `fonts/woff2/SpaceGrotesk[wght].woff2`, copied
without changing the font data. Its weight range is 300–700. Licence texts were
retrieved from the official repositories on 26 October 2026. The original
provenance of the three already installed families was not recorded in the
repository; their files are reused without alteration and upstream licence
notices have been added. Their loading is checked in browser QA.

CSS uses `font-display: swap` and system sans-serif or monospace fallbacks.
Silkscreen remains the shared header/footer voice; Space Grotesk is limited to
GTA VI display text, Inter to body copy, and Geist Mono to metadata.

Licence text line endings and trailing whitespace are normalized; copyright
notices and licence wording are preserved.
