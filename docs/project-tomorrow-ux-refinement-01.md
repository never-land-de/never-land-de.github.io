# PROJECT TOMORROW — UX Refinement 01

Die vorhandene Terminal-Version wurde direkt überarbeitet. Farbpalette, Typografie, CRT-/Lochkarten-Details und alle narrativen Inhalte bleiben erhalten. Keine zweite Terminal-Version, kein Push oder Deployment.

## Änderungen

- Eine kompakte Header-Zeile vereint T77, PROJECT TOMORROW, N.E.V.E.R.-77 und Terminal-ID. Experimental Computing Division bleibt untergeordnet. Der große zusätzliche Systemkopf im Panel entfällt.
- Grid/Flexbox und dynamische Viewporthöhe geben der Konsole den verfügbaren Platz. Außenabstände und Rahmeninnenabstände sind reduziert; die Eingabe bleibt am unteren Konsolenrand. Die Visual-Viewport-Anpassung berücksichtigt mobilen Tastaturplatz.
- Jeder eigenständige Command ersetzt den vorherigen sichtbaren Output vollständig und beginnt oben. Laufende Exit-/Interpreter-Interaktionen dürfen ihren eigenen Verlauf fortschreiben. Die interne Command-History bleibt unverändert; `clear` leert die Ausgabe ohne zusätzliche Statusmeldung.
- Logfiles erscheinen direkt in der Konsole. Der neue interne Pager misst reale Schrift, Umbruchbreite und verbleibende Ausgabehöhe. Lange Ausgaben und Listen erhalten Bildschirmseiten; bestehende redaktionelle Log-Seitengrenzen bleiben erhalten. Kein Logtext wird gekürzt oder verändert.
- Seitennavigation per PREVIOUS/NEXT, PageUp/PageDown und Touch. Beim Größenwechsel wird die Aufteilung neu berechnet. Extrem geringe Höhe nutzt nötigenfalls internes Scrollen. Eingabe und Navigation besitzen getrennte Layoutbereiche.
- CLOSE / RETURN TO SITE steht rechts unten unter RESEARCH USE ONLY / FICTIONAL SYSTEM. Der Link bleibt auch bei niedriger Höhe sichtbar und per Tab erreichbar.

Bearbeitet: `station/index.html`, `station/station.css`, `station/terminal.mjs`, `tests/station_browser.mjs`, `docs/project-tomorrow.md`, Verweis im bisherigen Completion Report. Neu: `station/pager.mjs` und dieser Bericht.

`station/commands.mjs`, `station/logs.mjs` und `station/state.mjs` sind anhand der vor/nach der Änderung erfassten SHA-256-Prüfsummen bytegleich. Es wurden keine anderen Website-Seiten oder globalen Styles verändert.

## Tatsächlich ausgeführte Tests

| Test | Ergebnis |
| --- | --- |
| `node --test tests/station.test.mjs` | 13/13 Funktionstestgruppen bestanden |
| `python3 tests/station_links.py` | 3/3 Link-/Integrationsgruppen bestanden |
| `node tests/station_browser.mjs` | 13/13 Browsergruppen bestanden |
| `git diff --check` | Keine Whitespace-Fehler |

Echter installierter Chrome im Headless-Modus, ohne neue Abhängigkeiten. Geprüfte Größen: **1920×1080, 1366×768, 768×1024, 390×844, 320×568, 844×390, 390×400, 390×300**, zusätzlich **390×240** für die Scroll-Rückfallebene.

Der Browserlauf prüfte:

- Mehrere eigenständige Commands nacheinander, Enter und RUN: nur aktueller Command sichtbar, Ausgabe beginnt oben. `clear` leert auch Seitennavigation und Statusmeldung.
- `help`, `list`, `status`, `execute`, `clear`, `exit` und `interpreter` über alle acht regulären Testgrößen. Bei jedem Schritt bleiben Eingabeposition und Eingabehöhe unverändert; keine horizontale Seitenausdehnung.
- `list`: alle 18 Einträge über die Seiten erreichbar; Pagination bei Platzmangel, korrekter Final-Operator-Status.
- Lange temporäre QA-Logtexte mit Wortumbrüchen, Unicode und zwei redaktionellen Seiten: Rekonstruktion aus allen Bildschirmseiten stimmt zeichengetreu mit der Quelle überein. Jede reguläre Bildschirmseite passt in die Ausgabehöhe. Produktionslogs enthalten keine Testtexte.
- Previous/Next, PageUp/PageDown und echte emulierte Touch-Aktivierung der Seitenschaltfläche.
- History-Pfeiltasten und Entwurfswiederherstellung, Exit Y/N einschließlich ungültiger Antwort, Interpreter `back`/Escape, alle narrativen Zustandsübergänge und Reload-/Reboot-Erhalt.
- Verschobener Close-Link unter dem Fiktionshinweis, außerhalb des Headers, innerhalb des Viewports; Tab-Erreichbarkeit bei 240 Pixeln Höhe, tatsächliche Rückkehr und Browser-Zurück.
- Unveränderte sichere Textausgabe, lokaler Composer, Dialogfokus, Reduced Motion und benannte Elemente im Accessibility-Tree.
- Keine JavaScript-Ausnahmen, fehlgeschlagenen Requests, HTTP-Fehler oder externen Requests im lokalen Browserlauf.

Screenshots von Desktop, Smartphone und geringer Höhe wurden zusätzlich visuell geprüft. Artefakte des abschließenden Browserlaufs: `/var/folders/74/s2s6r9vs4q965sn8chkp1yzr0000gn/T/station-browser-C6oSXK/` mit acht Screenshots und `results.json`. Der temporäre Ordner kann vom Betriebssystem bereinigt werden.

Die Prüfung mobiler Tastaturen erfolgt über verfügbare Viewporthöhen; echte iOS-/Android-Geräte und Safari/VoiceOver wurden nicht separat getestet.

Lokal: vorhandenen HTTP-Server verwenden oder aus dem Repository-Root `python3 -m http.server 8000 --bind 127.0.0.1` starten, dann <http://127.0.0.1:8000/station/index.html> öffnen. Ausführliche Start-/Reset-Anleitung: [project-tomorrow.md](project-tomorrow.md).
