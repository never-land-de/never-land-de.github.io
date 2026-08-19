# Never Land portal refresh — setup notes

This prototype modernises the 2003 portal structure without changing its basic visual idea.

## Files

- `index.htm` — HTML5 version of the portal
- `css/home.css` — responsive Never Land styles
- `css/bootstrap.min.css` — **not bundled**; add the official compiled Bootstrap 5.3.x CSS here

## Bootstrap

Use the official Bootstrap 5.3 compiled CSS and save the minified file as:

`./css/bootstrap.min.css`

`home.css` must load **after** Bootstrap so Never Land's custom design rules win the cascade.

The portal itself uses native CSS Grid because its required breakpoint is exactly 850px, not one of Bootstrap's default breakpoints. Bootstrap remains available for Reboot, utilities, tables and later subpages. No Bootstrap JavaScript is needed for this page.

## Self-hosted fonts

The stylesheet expects these files under `./fonts/`:

- `InterVariable.woff2`
- `InterVariable-Italic.woff2`
- `Silkscreen-Regular.woff2`
- `Silkscreen-Bold.woff2`
- `GeistMono-Variable.woff2`

If your downloaded files have different names, either rename them or adjust the `@font-face` URLs in `css/home.css`.

Inter is the body/UI font for headings, paragraphs, links, tables and controls. Silkscreen is assigned to header and footer. Geist Mono is assigned to `blockquote` / `.blockquote` and remains available through the `.font-mono` utility class.

## Existing 2003 graphics

The prototype deliberately keeps the old paths:

- `./essentials/clouds.gif`
- `./essentials/portal/head.gif`
- `./essentials/portal/foot.gif`
- `./essentials/portal/willkommen.gif`
- `./essentials/portal/egoshow.gif`
- `./essentials/portal/sisters.gif`
- `./essentials/portal/galerie.gif`

Replace these later without changing the layout code.

## Adding another portal tile

Copy an existing `<article class="site-panel portal-tile">...</article>` block in `index.htm` and change its `--tile-image` plus content. CSS Grid adds the new tile automatically.

For an intentionally full-width tile on desktop, add `portal-tile--wide`.

## Responsive rules

- maximum portal width: `1100px`
- `>= 850px`: two columns
- `< 850px`: one column
- header and footer remain single panels and reflow internally on narrow screens
- all header, footer and tile panels round only the top-right and bottom-left corners

## GitHub Pages vs. conventional webspace

The HTML/CSS itself is host-agnostic because it uses relative paths. If GitHub Pages is the final target, use `index.html` as the published entry file. For a conventional webspace, follow the host's directory-index configuration; `index.html` is also the safest general default.
