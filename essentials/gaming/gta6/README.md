# Leonida media / Pre-launch v0.1

## Ticket to Paradise

`gta6_preorder.jpg` is the original, unmodified Xbox pre-order screenshot
(1536 × 1152). It documents Grand Theft Auto VI: Ultimate Edition, the
19 November 2026 expected date and “Im Besitz” ownership status.

The dedicated ticket section displays the entire image using responsive
`width: 100%; height: auto; object-fit: contain`, with descriptive alt text,
an editorial caption and links to the original for reading small store text.
Never use it as a cropped hero or game-tile background. The game artwork and
store interface shown remain the property of their respective owners.

## Planned background artwork

No custom hero or background artwork is installed. The page uses decorative
CSS gradients without requesting missing assets. Add artwork here only after
its source and credits are known:

| File | Purpose | Suggested size |
| --- | --- | --- |
| `gta6_hero_desktop.webp` | Wide hero | 2200 × 1250 or larger |
| `gta6_hero_mobile.webp` | Mobile composition | 860 × 1300 or larger |
| `gta6_background.webp` | Subtle page atmosphere | 1920 × 2160 or larger |

Activate the corresponding `none` hooks at the top of `css/gta6.css` using the
commented local URLs. Retain gradient fallbacks and text contrast. Desktop
artwork is selected at 900px; mobile retains its own fallback if its artwork
is absent. Recheck all six target widths when adding images.

## Postcards

The initial gallery is introductory copy, with no empty photograph cards.
When actual personal captures exist, add a `.gta6-gallery` container inside
`#postcards`. Use `.gta6-postcard` figures with linked local images and factual
captions. For example, only after creating the referenced file:

```html
<div class="gta6-gallery">
    <figure class="gta6-postcard">
        <a href="../essentials/gaming/gta6/first-arrival.webp">
            <img src="../essentials/gaming/gta6/first-arrival.webp"
                 alt="Describe the actual scene" width="1920" height="1080" loading="lazy">
        </a>
        <figcaption><h3>A factual title</h3><p>Location and capture date</p></figcaption>
    </figure>
</div>
```

Use actual pixel dimensions. Prepared gallery styles preserve both portrait
and landscape proportions with no filters or forced cropping.

## Personal travel record

- The passport contains seven editorial fields, including Ultimate Edition.
  The expected arrival date comes from the supplied pre-order record.
- There is no countdown or date-driven status transition. Update ARRIVAL
  PENDING and NOT YET RECORDED only when a first visit actually takes place.
- Add location stamps only for actual visits; list items wrap responsively.
- Publish journal entries and personal clips only when real content exists.
  The pre-arrival note describes intentions, without gameplay impressions.
- The broadcast area links to Rockstar’s official GTA VI site. It loads no
  remote player, autoplay media, tracking script or thumbnail.
- Update the colophon when adding gameplay captures or publisher artwork,
  identifying their actual sources.
