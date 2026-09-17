# Never Land — Sisters archive migration

This bundle is meant to be copied over the root of the existing
`never-land-de.github.io` repository. It contains only new or changed files.

## Included

- Four gig reviews under `sisters/gigs/`
- The book review under `sisters/features/`
- The Sisters archive about page at `sisters/about.html`
- 81 local image/video assets under `essentials/sisters/`
- The shared editorial stylesheet at `css/editorial.css`
- Updated links and archive cards in `sisters/index.html`
- Review links in the matching rows of `sisters/gigs.html`

## Test on macOS

1. Copy the bundle contents into the root of your local repository, preserving
   the folder structure.
2. In Terminal, change to that repository folder.
3. Start a local server:

   ```bash
   python3 -m http.server 8000
   ```

4. Open <http://localhost:8000/sisters/index.html> in Safari.
5. Stop the server afterwards with `Control-C`.

## Acceptance checklist

- The Sisters start page shows six cards under `FROM THE ARCHIVE`.
- The gigography links only these rows: Ternat 2001, Köln 2019, Utrecht 2019,
  Amsterdam 2023.
- Each gig review shows its setlist prominently before the review on mobile and
  beside the review on desktop.
- Every gallery image opens at its locally stored 1024 px version.
- The Amsterdam page plays the locally stored MP4; YouTube embeds need an
  internet connection.
- Check at approximately 390 px, 768 px and desktop width.

No deployment or commit has been performed.
