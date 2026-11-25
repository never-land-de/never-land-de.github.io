# PROJECT TOMORROW — UX Refinement 02

Die vorhandene Konsole baut ihre Ausgabe jetzt sichtbar auf: alter Inhalt verschwindet sofort, ein leeres Bild wird gezeichnet, danach folgt die neue Ausgabe. Kurze Antworten erhalten kleine Zeichengruppen, längere Seiten größere Textblöcke. Ein dezenter, nicht blinkender Cursor zeigt die Schreibposition. Alle Geschwindigkeitswerte stehen zentral in `OUTPUT_TIMING` in `station/output.mjs`.

Eingabe, RUN und Seitenschalter sind während des Aufbaus gesperrt. Der Submit-Handler blockiert zusätzlich direkte und schnelle wiederholte Übermittlungen, sodass kein zweiter Command ausgeführt wird. Nach Fertigstellung kehrt der Fokus zur Eingabe zurück. `clear` leert sofort ohne Effekt oder Statusmeldung. Exit-/Interpreter-/Panic-Schritte werden ebenfalls einzeln neu aufgebaut; ihre Commands und Story-Zustände sind unverändert. Der Composer öffnet sich nach Abschluss seiner Terminalausgabe.

Reduced Motion überspringt das Tippen, erhält aber das tatsächlich gezeichnete leere Zwischenbild. Seitenwechsel nutzen den gleichen Renderer. Reine Größenänderungen im Ruhezustand verändern weder Fokus noch Eingabesperre; aktive Animationen werden bei Resize oder Escape sauber abgebrochen und ersetzt. Veraltete Renderläufe können weder Text nachschreiben noch die Eingabe zu früh freigeben. Der Output trägt während des Aufbaus `aria-busy`; die Live-Region meldet erst das Ergebnis.

## Dateien

- Neu: `station/output.mjs` — Ausgabeutility mit abbrechbaren Timern/Frames, Unicode-sicherem Aufbau und Reduced-Motion-Erkennung.
- Geändert: `station/pager.mjs` — animierte Seitenanzeige, Sperre und Abschlusskoordination über Größenänderungen hinweg.
- Geändert: `station/terminal.mjs` — Submit-Sperre, Fokus, Statusmeldungen und einzelner Screen je Dialogschritt.
- Geändert: `station/station.css` — Schreibcursor und dezente Darstellung der deaktivierten Eingabe.
- Geändert: `tests/station_browser.mjs` — auf asynchrone Ausgabe angepasst und um Frame-Messungen/Race-Prüfungen ergänzt.
- Aktualisiert: allgemeine Dokumentation und Verweis im ursprünglichen Completion Report; neu: dieser Bericht.

Die SHA-256-Prüfsummen von `station/commands.mjs`, `station/logs.mjs` und `station/state.mjs` bleiben gegenüber dem vorherigen Stand unverändert. Keine Änderung an Lore, Command-Engine, Website-Einstieg oder anderen Seiten. Keine neuen Abhängigkeiten, kein Push oder Deployment.

## Prüfung

Die Browserprüfung zeichnet Frames mit sichtbarem Text, Sperrzuständen, Eingabeposition und Scrollposition auf. Sie prüft das leere Zwischenbild, sichtbare Teilausgaben, zügigen Abschluss, anschließenden Fokus und ausbleibendes Nachschreiben älterer Animationen. Zusätzlich werden Diagnosen, Listen, Logs, Exit, beide Dialogzugänge, Pagination mit Tastatur/Touch, Größenwechsel während des Renderns, lokaler Composer, Zustandswiederherstellung, Sicherheit und Reduced Motion getestet.

Tatsächlich ausgeführter abschließender Teststand:

| Prüfung | Ergebnis |
| --- | --- |
| `node --test tests/station.test.mjs` | 13/13 Funktionstestgruppen bestanden |
| `python3 tests/station_links.py` | 3/3 Link-/Integrationsgruppen bestanden |
| `node tests/station_browser.mjs` | 16/16 Browsergruppen bestanden |
| Syntaxprüfungen der neuen/geänderten Module und `git diff --check` | Ohne Fehler |

Der echte lokale Chrome-Lauf prüfte kurze Antworten, alle öffentlichen Diagnoseausgaben, `list`, Logfiles, einzelne Exit-/Interpreter-/Panic-Schritte und Seitenwechsel. Aufgezeichnete Zwischenbilder enthielten zunächst keinen Text, dann sichtbare Teilausgaben. Während dieser Phasen waren Eingabe und RUN deaktiviert und `aria-busy` aktiv. Nach Abschluss war die Eingabe wieder fokussiert; kein Schreibcursor blieb zurück. Die gemessenen normalen Testausgaben schlossen jeweils innerhalb von 1,8 Sekunden ab. Acht schnelle direkte erneute Übermittlungen sowie wiederholtes Enter/RUN führten keinen weiteren Command aus.

Lange QA-Logs wurden nach animiertem Blättern zeichengetreu aus allen Bildschirmseiten rekonstruiert. Bei Reduced Motion gab es ausschließlich leere und vollständige Zwischenbilder, keine Zeichenanimation. Eingabeposition und Scrollposition blieben in den aufgezeichneten regulären Renderläufen unverändert. Resize und Escape während einer aktiven Animation hinterließen nur die gültige neue Ausgabe; nachfolgende Commands wurden nicht durch alte Timer überschrieben. Der Browserlauf meldete keine JavaScript-/HTTP-Fehler oder externen Requests.

Layout-/Eingaberegressionen liefen bei 1920×1080, 1366×768, 768×1024, 390×844, 320×568, 844×390, 390×400, 390×300 und zusätzlich 390×240 für die Scroll-Rückfallebene. Screenshots und `results.json` des abschließenden Laufs liegen temporär unter `/var/folders/74/s2s6r9vs4q965sn8chkp1yzr0000gn/T/station-browser-607SWh/`.

Wiederholen mit laufendem lokalem HTTP-Server:

```sh
node --test tests/station.test.mjs
python3 tests/station_links.py
node tests/station_browser.mjs
```

Die Website selbst benötigt weiterhin nur einen statischen Server. Der optionale Browsertest nutzt vorhandenes Node 22+ und Chrome ohne Testpakete. Echte mobile Bildschirmtastaturen und Safari/VoiceOver sind durch Chrome-Emulation nicht vollständig abgedeckt.
