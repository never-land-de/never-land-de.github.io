# GTA VI / Welcome to Leonida — Pre-launch v0.1

Prepared 8 November 2026 from the existing local implementation. Static HTML
and CSS, using the existing Never Land navigation script; no build system or
new runtime dependency.

## Files and behaviour

- `gaming/gta6.html`: WELCOME TO LEONIDA hero, editorial introduction,
  seven-field Travel Passport, Ticket to Paradise purchase record, postcard
  introduction, pre-arrival journal note, off-air broadcast area and official
  Rockstar trailer link. Existing RDR2-style header, navigation and footer.
- `css/gta6.css`: isolated Leonida palette, Space Grotesk display typography,
  Inter body copy, Geist Mono metadata, responsive document and receipt styles,
  gallery styles prepared for actual captures, focus and reduced-motion support.
- `gaming/index.html`: prominent full-width GTA VI entry linking to
  `./gta6.html`, labelled PRE-LAUNCH / ARRIVAL PENDING; added to the hub’s mobile
  submenu. Cyberpunk, RDR2, Pokémon GO and Retro Gaming remain. Two existing
  future-tile ARIA errors fixed with semantic group roles.
- `essentials/gaming/gta6/gta6_preorder.jpg`: included unchanged at its original
  1536 × 1152 dimensions. Responsive uncropped image, `object-fit: contain`,
  descriptive alt text, full-size links and “The ticket is booked. Paradise
  awaits.” caption. Edition and ownership details are retained.
- `essentials/gaming/gta6/README.md`: media and editorial maintenance guide.
- `assets/fonts/SpaceGrotesk-Variable.woff2` and `assets/fonts/licenses/`:
  existing local font and associated licence/source documentation included.
- `tests/gta6_browser.mjs`: existing dependency-free Chrome QA extended for
  purchase details, image proportions, pending-date behaviour and hub entry.
- `docs/gta6-qa.json`: concise machine-readable acceptance evidence.
- `docs/gta6-phase1.md`: this report.

The passport explicitly records Ultimate Edition, Xbox Series X, NL-VC-0001,
Vice City, Leonida, ARRIVAL PENDING, 19 November 2026 and NOT YET RECORDED.
There is no countdown and no automatic arrival transition. The expected date
is the supplied personal pre-order record. No gameplay visits, photographs,
recordings or fictitious stamps are claimed. Future sections contain editorial
introductions rather than empty image cards, fake posts or dead links.

## QA

`node tests/gta6_browser.mjs`: **18 checks passed** in installed Chrome.

- GTA VI and hub: **320, 390, 430, 768, 1440 and 1920 px**; no horizontal
  overflow, correct responsive navigation, passport and receipt fit.
- Original screenshot loads at 1536 × 1152 and keeps its 4:3 ratio at every
  viewport. Small store text can be opened at full size; the essential purchase
  information is also repeated as accessible HTML.
- Local fonts decode; no broken resources, uncaught exceptions, external
  page resources, media embeds or Cyberpunk background leakage on GTA VI.
- Keyboard skip link, visible focus, passport anchor, mobile menu focus trap,
  Escape, focus restoration and desktop resize behaviour pass.
- Reduced motion removes page and menu transitions. Prepared future gallery
  retains portrait/landscape proportions; passport stamps wrap at 320px.
- Date simulation on 18, 19 and 20 November 2026 and 1 January 2027 leaves
  personal arrival status pending.
- RDR2 and Cyberpunk smoke tests at 320, 768 and 1440px pass. Shared assets,
  existing game pages and their styles remain unchanged.
- W3C Nu HTML validation: GTA VI has **0 errors / 0 warnings**; Gaming hub
  has **0 errors**, with 15 existing advisory heading warnings in inherited
  navigation and dynamically populated sections.
- Local asset/fragment references, unique IDs, one h1, image alternatives,
  active CSS asset paths and Git whitespace checks pass. Official Rockstar
  link and both fixed local preview URLs returned HTTP 200.
- SHA-256 verification confirms the original screenshot and unrelated tracked
  local modifications remain byte-for-byte intact.

Browser certification is limited to Chrome; Safari/Firefox and assistive
technology sessions were not run. Final artwork needs a fresh contrast and
composition review. Screenshots and full runtime reports are written to the
temporary artifact directory printed by the browser test.

## Preview and delivery

From the repository root, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Page: http://127.0.0.1:8000/gaming/gta6.html

Hub: http://127.0.0.1:8000/gaming/index.html

GitHub file: https://github.com/never-land-de/never-land-de.github.io/blob/main/gaming/gta6.html

Delivery targets `origin/main` with commit message
`feat(gaming): launch GTA VI Leonida pre-release page`. The final delivery
message records the resulting commit SHA and verified push state. GitHub is
the only publication target; production hosting, DNS and SSL are outside scope.
Unrelated workspace changes and existing commits are preserved.

## Outstanding content

Optional desktop/mobile hero and background artwork, followed by real personal
postcards, journal entries and recordings after the first actual visit. Until
then, the gradient fallback and pending travel record are intentional.
