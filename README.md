# Never Land — 2003 / 2026 rebuild

Never Land is a static personal web project that rebuilds the original 2000–2003 `never-land.de` portal for 2026 without discarding its early-web character.

The current version keeps the visual grammar of the old site — image-led portal tiles, bitmap typography, compact navigation, textured backgrounds and asymmetric panels — but rebuilds it with semantic HTML5, responsive CSS, locally hosted fonts and Bootstrap 5.3.x as a baseline.

## Current status

The 2026 rebuild has been promoted from the former `2026prototype/` directory to the repository root.

- `main` — current production version and GitHub Pages source
- `legacy/2003-site` — archived pre-cutover site, kept as a historical snapshot and not intended for deployment
- `release/2026` — temporary cutover/release branch; no longer the production source and can be removed once no longer needed
- the former `2026prototype/` directory is no longer part of `main`

The site is currently served from the repository root through GitHub Pages.

## Current repository structure

```text
/
├── index.html
├── README.md
├── assets/
│   └── fonts/
│       ├── GeistMono-Variable.woff2
│       ├── InterVariable-Italic.woff2
│       ├── InterVariable.woff2
│       ├── Silkscreen-Bold.woff2
│       └── Silkscreen-Regular.woff2
├── css/
│   ├── bootstrap.min.css
│   ├── bootstrap.min.css.map
│   ├── collection.css
│   ├── doorpage.css
│   └── home.css
├── essentials/
│   ├── clouds.gif
│   ├── pages/
│   └── portal/
└── sisters/
    ├── index.html
    ├── collection.html
    ├── gigs.html
    └── image assets
```

The repository also still contains a few housekeeping / legacy files such as `.DS_Store` and `.render_temp_index2.html`. They are not dependencies of the 2026 site.

## CSS architecture

Stylesheets are layered deliberately:

1. `css/bootstrap.min.css`
2. `css/home.css`
3. page-specific CSS where required

### `bootstrap.min.css`

Bootstrap **5.3.8** is bundled locally. The site does not depend on a CDN.

Bootstrap provides the base reset/reboot, tables, badges and utility behaviour. The portal layout itself uses native CSS Grid because the design breakpoint is intentionally `850px`, not a Bootstrap breakpoint.

No Bootstrap JavaScript is currently required.

### `home.css`

The shared Never Land design system.

It contains:

- locally hosted font declarations
- global typography and colour tokens
- the `1100px` site shell
- the asymmetric Never Land panel shape
- sticky header and shared footer
- the responsive portal grid
- portal tiles
- legacy-compatible link/text utility classes
- reusable image-backed navigation tiles
- reduced-motion handling
- Inter OpenType / variable-font settings

### `doorpage.css`

Shared category-doorpage layer intended for:

- SISTERS
- MUSIC
- TECH
- GAMING

It provides the large visual hero, editorial image grid, intro blocks, link lists and responsive category-page layout.

At present, **SISTERS is the implemented doorpage**.

### `collection.css`

Shared long-form/table layer currently used by the Sisters collection and gigography pages.

It provides:

- dark translucent content panels
- Sisters-specific full-page background treatment
- section jump navigation
- responsive tables
- list styling
- back-to-top links
- mobile record/card conversion below `700px`
- mobile year handling for grouped collection entries
- a specific mobile treatment for the `Bands` field so `SISTERS` and supporting acts remain together instead of being split into separate grid items

## Typography

Fonts are self-hosted under `assets/fonts/`.

### Inter

Primary body and UI typeface.

Current CSS uses:

```text
InterVariable.woff2
```

`InterVariable-Italic.woff2` is also present in the repository for later use.

### Silkscreen

Bitmap/pixel display typeface used for the site's retro-digital identity, including header/footer UI, portal titles and navigation elements.

```text
Silkscreen-Regular.woff2
Silkscreen-Bold.woff2
```

### Geist Mono

Monospaced secondary voice used for quotations and available through the `.font-mono` utility.

```text
GeistMono-Variable.woff2
```

## Core visual rules

The 2026 rebuild deliberately keeps a small set of strong layout rules:

- maximum content width: `1100px`
- portal breakpoint: `850px`
- `>= 850px`: two portal columns
- `< 850px`: one portal column
- compact mobile typography below `560px`
- major panels round only the **top-right** and **bottom-left** corners
- header remains sticky
- portal/category imagery uses `cover` sizing
- the design remains usable down to a `320px` viewport
- motion-sensitive users get reduced animation/hover movement through `prefers-reduced-motion`

## Reusable image-link tiles

`home.css` now includes a shared navigation component for section links and cross-links:

```html
<div class="site-link-grid">
    <a
        class="site-link-tile"
        href="./collection.html"
        style="--site-link-image: url('../essentials/pages/example.gif');"
    >
        <span>COLLECTION</span>
    </a>
</div>
```

Available CSS custom properties include:

```text
--site-link-image
--site-link-position
--site-link-shade-top
--site-link-shade-bottom
--site-link-columns
--site-link-columns-mobile
--site-link-min-height
--site-link-min-height-mobile
--site-link-padding
--site-link-font-size
```

Without `--site-link-image`, the component falls back to a translucent dark surface.

The component follows the same asymmetric border-radius language as the rest of Never Land.

## Homepage

`index.html` is now the production entry page at repository root.

The portal currently contains four visual sections:

- **SISTERS**
- **MUSIC**
- **TECH**
- **GAMING**

The portal retains the original 2003-era concept of image-backed category panels while using a responsive CSS Grid layout.

Current artwork includes, among other assets:

```text
essentials/portal/sisters-ae-2001.gif
essentials/portal/music-holygram.gif
essentials/portal/osxtiger.gif
essentials/portal/cyberpunk2077somi.gif
essentials/portal/head.gif
essentials/portal/foot.gif
essentials/clouds.gif
```

The global header now points towards the new category structure:

```text
/sisters/index.html
/music/index.html
/tech/index.html
/gaming/index.html
```

Only the Sisters category is currently implemented in `main`. MUSIC, TECH and GAMING remain planned routes, and some tile-level legacy links are still transitional until those sections are rebuilt.

## Sisters doorpage

`sisters/index.html` is the first fully rebuilt category landing page.

It contains:

- shared Never Land header/footer
- a wide SISTERS hero
- current Utrecht 2019 hero artwork
- a personal introduction to the section
- a responsive three-image editorial gallery
- current gallery material from Amsterdam 2023, Tilburg 2005 and Ternat 2001
- a curated useful-links section
- image-backed `COLLECTION` and `GIGS I'VE SEEN` explore tiles

The doorpage is driven by `css/doorpage.css` plus the shared styles in `css/home.css`.

## Sisters collection

`sisters/collection.html` rebuilds the analogue Sisters collection as a responsive long-form page.

Current sections:

- Music
- Bootlegs
- Shirts
- Collectibles

The desktop layout keeps conventional semantic tables. Below `700px`, table rows become self-contained mobile cards while the semantic table structure remains in the DOM.

The collection also preserves compact grouped years on desktop while exposing a full year value for every mobile record.

## Sisters gigs

`sisters/gigs.html` uses the same responsive long-form/table system.

The current gigography covers Sisters shows seen since M'era Luna 2000 and currently records **25 attended gigs plus 3 upcoming shows**.

Upcoming 2026 dates are marked with Bootstrap warning badges.

On mobile, the generic table-card layout has an explicit exception for the `Bands` field so the bold `SISTERS` label and the accompanying support acts stay visually together.

A future cross-link to the broader non-Sisters gigography is already present but depends on the planned MUSIC section.

## Existing 2003 material

The rebuild intentionally reuses selected original Never Land assets rather than recreating the entire visual identity from scratch.

The legacy material is now split conceptually into two places:

1. selected imagery reused by the 2026 build under `essentials/`
2. the complete old repository state preserved in `legacy/2003-site`

The archive branch should remain untouched unless a deliberate historical correction is required.

## Adding another portal tile

Copy an existing portal article in `index.html`:

```html
<article
    class="site-panel portal-tile"
    style="--tile-image: url('./path/to/image.gif');"
>
    ...
</article>
```

CSS Grid will place additional tiles automatically.

For a tile that should span the full desktop grid, add:

```text
portal-tile--wide
```

## Adding another category doorpage

A future MUSIC, TECH or GAMING landing page should follow the Sisters structure:

```html
<link href="../css/bootstrap.min.css" rel="stylesheet">
<link href="../css/home.css" rel="stylesheet">
<link href="../css/doorpage.css" rel="stylesheet">
```

Reuse the established components:

```text
.site-shell
.site-panel
.site-header
.doorpage-main
.doorpage-hero
.doorpage-intro
.doorpage-gallery
.site-link-grid
.site-link-tile
.site-footer
```

This keeps the portal identity consistent without duplicating the shared design system.

## Adding collection/gigography records

The responsive mobile layout depends on `data-label` attributes on table cells.

Example:

```html
<tr>
    <td data-label="Year">2026</td>
    <td data-label="Month">Oct</td>
    <td data-label="Day">05</td>
    <td data-label="City">Köln, Germany</td>
    <td data-label="Venue">E-Werk</td>
    <td data-label="Bands"><b>SISTERS</b></td>
</tr>
```

Keep these attributes when adding rows; they supply the field labels used by the mobile card layout.

## GitHub Pages / deployment

The production model is intentionally simple:

```text
main
└── repository root
    └── index.html
```

GitHub Pages publishes the current 2026 site from `main`.

`legacy/2003-site` exists only as the archived pre-2026 state and should not be synchronised with `main`.

`release/2026` was used for the root-level cutover. Once it is no longer useful for review/history, it can be deleted without affecting the production site or the legacy archive.

## Relative paths

The site remains static and primarily uses relative paths so it can be hosted on GitHub Pages or conventional webspace.

Because stylesheets live under `css/`, asset references inside CSS generally step back to repository root, for example:

```css
url("../essentials/clouds.gif")
url("../assets/fonts/InterVariable.woff2")
```

HTML files at repository root and HTML files inside category directories therefore require different relative link depths. Check paths carefully whenever pages are moved between directories.

## Known transitional items

The rebuild is now live, but not every planned 2026 section is complete.

Current transitional items include:

- MUSIC, TECH and GAMING category directories are referenced by the global navigation but are not yet present in `main`
- several homepage tile links still point to legacy/placeholder destinations
- the broader MUSIC gigography referenced from `sisters/gigs.html` is not yet implemented in the current root structure
- the fixed/cover background used by `collection.css` should continue to be tested on mobile Safari, where `background-attachment: fixed` can behave differently from desktop browsers
- a few non-production housekeeping files remain in repository root and can be cleaned up separately

## Philosophy

The aim is not to make Never Land look like a generic modern portfolio.

It is a **2003 website rebuilt with 2026 implementation discipline**:

- static
- fast
- image-led
- personal
- deliberately retro-digital
- responsive without losing the original composition
- modernised selectively rather than aesthetically replaced
