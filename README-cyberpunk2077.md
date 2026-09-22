# Cyberpunk 2077 page — integration notes

Copy the supplied files into the existing `never-land-de.github.io` repository:

- `gaming/cyberpunk2077.html`
- `css/cyberpunk2077.css`

The page expects the existing shared files at:

- `css/bootstrap.min.css`
- `css/home.css`
- `essentials/clouds.gif`
- `essentials/portal/head.gif`

## Media

Place the image folders shown in the supplied Explorer screenshots here:

```text
essentials/
└── gaming/
    └── cyberpunk2077/
        └── cp2077_pixelart/
            ├── cyberpunk2077_pixelart_….png
            └── Originals/
                └── cyberpunk2077_….png
```

The hero expects:

```text
essentials/gaming/cyberpunk2077/cp2077_pixelart/cyberpunk2077_pixelart_v_musamura_pacifica_beach.png
```

The NUSA feature expects:

```text
essentials/gaming/cyberpunk2077/cp2077_pixelart/Originals/cyberpunk2077_nusa_map.png
```

Image names in `cyberpunk2077.html` are based on the Explorer screenshots. Because web servers are case-sensitive, check capitalisation and `.png` extensions after copying the folders.

## Savegame archive

Create the ZIP archive and place it here:

```text
downloads/cyberpunk2077/cyberpunk2077-savegames-september-2026.zip
```

The page uses a relative download URL, so it works unchanged on both `never-land.de` and `never-land-de.github.io`.

## Optional portal link

In the GAMING tile of the root `index.html`, replace the plain text entry with:

```html
<a class="whiteportal" href="./gaming/cyberpunk2077.html">Cyberpunk 2077</a><br>
```

## Paths to verify

The attached homepage source appears to contain legacy or provisional navigation paths. The new page uses the intended top-level routes (`sisters/`, `music/`, `tech/`, `gaming/`) and `.html` option links. Adjust these four navigation destinations if the live repository uses different canonical paths.
