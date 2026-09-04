NEVER LAND – eMail parser mini-game / rev. 2026.09b
=====================================================

Drop-in structure:

/index.html
/options/email.html
/options/technik.html
/options/impressum.html
/css/home.css
/css/bootstrap.min.css
/js/email.js
/essentials/options/never-land-2003.jpg

What changed in this revision
-----------------------------
1. /options/email.html
   Refreshed boot text. HELP remains the obvious entry point; 404 is now a
   deliberately visible hint that there is more hiding in the parser.

2. /js/email.js
   Expanded vanilla-JS parser with references to The Sisters Of Mercy's 2002
   "ERROR 404, PAGE NOT FOUND / Barely Interactive Fiction" page.

   Directional commands now nod to locations and details from that page:
   NORTH, SOUTH, EAST, WEST and UP. Further optional references include
   CHEMIST, SUNGLASSES, READ SIGN, DRUM MACHINE, FAKE JAZZ NONSENSE, FROTZ,
   CRIMINAL CITY and THE SLOUGH OF DESPOND.

   ABOUT now also explains the site's name with the short Floodland reference:
   "we will never, never land."

   404 or SOURCE explains the homage. OPEN 404 opens the official original:
   https://www.thesistersofmercy.com/error404page.html

3. /css/home.css
   Existing stylesheet plus the isolated .nl-terminal rules and terminal-link
   styling. No new CSS file is required.

4. Footer links
   index.html, technik.html and impressum.html point their footer eMail link to
   the parser page. The direct mailto link remains available inside the
   terminal page as a fallback. A stale technik.htm reference in the bundled
   impressum.html has been corrected to technik.html.

5. Historical screenshot
   The already supplied 2003 screenshot is included at:
   /essentials/options/never-land-2003.jpg
   for the current technik.html reference.

GitHub Pages
------------
Everything is static HTML/CSS/JavaScript and works on GitHub Pages.
No API, database, build step or server-side component is used.
SEND opens mailto:jan@never-land.de in the visitor's local mail client.

Commands worth trying
---------------------
HELP, LOOK, ABOUT, CONTACT, EMAIL, SEND, INVENTORY, CLEAR, QUIT
NORTH, SOUTH, EAST, WEST, UP
404, SOURCE, OPEN 404

The optional cable/service-hatch puzzle remains in place.
