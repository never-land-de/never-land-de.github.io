# PROJECT TOMORROW — THE STATION · v1.1

Die eigenständige Experience liegt unter `station/index.html`. Einstieg ist der kleine `> EXECUTE _`-Link **unterhalb** des Footers von `tech/index.html`. Diese Seite ist über die vorhandene Hauptnavigation als TECH verlinkt. Eine `tech.html` existiert im Repository nicht; `options/technik.html` dokumentiert die Website-Technik und ist deshalb nicht der Einstieg.

## Lokal auf macOS starten

Im Terminal:

```sh
cd /Users/janpiatkowski/Documents/GitHub/never-land-de.github.io
python3 -m http.server 8000 --bind 127.0.0.1
```

Danach in Safari oder Chrome öffnen:

- Einstieg: <http://127.0.0.1:8000/tech/index.html> — bis unter den Footer scrollen.
- Direkt: <http://127.0.0.1:8000/station/index.html>.
- Server beenden: `Control-C` im Terminal.

Keine Projektinstallation und kein Build erforderlich. Falls `python3` auf dem Mac bereits verfügbar ist, ist keine zusätzliche Software nötig. HTML nicht per Doppelklick als `file://` starten: native JavaScript-Module benötigen einen HTTP-Ursprung. Bei belegtem Port beispielsweise `8001` verwenden und die Browseradresse anpassen.

## Architektur

| Datei | Aufgabe |
| --- | --- |
| `station/index.html` | Kompakte Terminal-Seite, Rückkehr-Link im Footer und nativer Composer-Dialog |
| `station/station.css` | Gekapselte CRT-, Lochkarten- und Rechnergestaltung; responsive Darstellung |
| `station/state.mjs` | Monotoner Story-State und fehlertoleranter Sitzungsspeicher |
| `station/commands.mjs` | Explizite Command-Registry, Parser, Interpreter und strukturierte Ergebnisaktionen |
| `station/logs.mjs` | 18 Archiveinträge, stabile Slugs, Seiten, Klassifizierung und geprüfte Links |
| `station/terminal.mjs` | Sichere DOM-Ausgabe, History-Navigation, Dialoge, lokale Vorschau und Viewport-Anpassung |
| `station/pager.mjs` | An der tatsächlichen Konsolenfläche gemessene Ausgabe- und Archivpagination |
| `station/output.mjs` | Abbrechbarer, gekapselter Clear-/Schreibeffekt mit zentralen Geschwindigkeitseinstellungen |
| `css/station-entry.css` | Ausschließlich der neue Link auf der Tech-Seite |

Die Seite nutzt vorhandenes lokales Bootstrap und die vorhandene Geist-Mono-Schriftdatei. Sie lädt keine globalen Website-Skripte oder externen Ressourcen. `.mjs` sind native Browsermodule; auf dem Hosting müssen sie als JavaScript ausgeliefert werden. Python liefert sie im lokalen Test korrekt aus. Bei späterer Übertragung alle relativen Ordnerpfade erhalten.

Renderer und Command-Engine sind getrennt: Befehle liefern Datenaktionen wie `output`, `log`, `composer` oder `navigate`; Nutzereingaben werden ausschließlich über `textContent` ausgegeben. Es existieren keine dynamische Codeausführung, Netzwerk-API, API-Schlüssel, Backend-, Framework- oder Build-Abhängigkeiten. Kein Tracking, Audio oder Service Worker wurde ergänzt.

## Commands

`help` listet die 16 öffentlichen Grundbefehle mit Syntaxhilfe. `email /urgent` ist eine Variante von `email`.

| Eingabe | Funktion |
| --- | --- |
| `help` | Öffentliche Befehle |
| `list` | Genau 18 Namen; Freigabestatus ausschließlich bei The Final Operator |
| `execute "Bartmoss Manifest"` | Archiv öffnen; ebenso `execute bartmoss-manifest` |
| `exit` | Fiktive Y/N-Abfrage; bei Y der vorgegebene Ablehnungssatz |
| `message` | Ausschließlich lokale Transmission-Vorschau |
| `email` | Vorgegebene S.E.T.I.-Sperrmeldung ohne abschließenden Punkt gemäß technischem Auftrag |
| `email /urgent`, `contact` | Bestehende Kontaktseite öffnen |
| `interpreter` | Simulierter Dialog; `back` kehrt zum Terminal zurück |
| `status` | Phasenabhängige, fiktive Diagnose |
| `whoami` | Operator-Kennung |
| `date` | Explizit fiktives Systemdatum und Installationsdatum |
| `history` | Tatsächliche Eingaben; später zusätzlich klar beschriftete fiktionale Phantomzeile |
| `clear` | Ausgabe löschen, Zustand und Verlauf erhalten |
| `reboot` | Anzeige neu aufbauen, Zustand und Verlauf erhalten |
| `ping` | Simulierte interne Kommunikationsdiagnose |
| `version` | Vorgegebene System-/Build-Kennung |

Commands sind unabhängig von Groß-/Kleinschreibung; überzählige Leerzeichen werden beim Parsen zusammengezogen. Der reale Verlauf bewahrt die eingegebenen Strings. Unbekannte Commands und nicht unterstützte Argumente ergeben `INVALID INPUT`; unbekannte Lognamen erhalten Syntaxhilfe. Pfeil hoch/runter navigiert den Verlauf und erhält den zuvor eingegebenen Entwurf. Der Verlauf bleibt ausschließlich im Arbeitsspeicher des aktuellen Dokuments.

Jeder Command ersetzt den gesamten vorherigen sichtbaren Output. Seit UX Refinement 02 erscheint zunächst ein tatsächlich leeres Bild, anschließend werden Command und Antwort zügig aufgebaut: kurze Antworten in kleinen Zeichengruppen, lange Ausgaben in größeren Textblöcken. Auch einzelne `exit`-, `interpreter`- und `panic`-Dialogschritte erhalten einen neuen Screen; ihr interner Eingabemodus bleibt erhalten. Eingabe und RUN sind bis zum Abschluss deaktiviert, weitere Übermittlungen werden abgefangen. Danach kehrt der Fokus zur Eingabe zurück. `history` zeigt den internen Verlauf weiterhin auf ausdrücklichen Abruf; `clear` leert die Ausgabe sofort ohne Effekt oder Statusmeldung.

Geschwindigkeit und Schwellenwerte stehen zentral in `OUTPUT_TIMING` in `station/output.mjs`. Ein bewegter, nicht blinkender Schreibcursor begleitet den Aufbau. Reduced Motion zeigt nach dem leeren Zwischenbild die komplette Seite direkt an. Seitenwechsel verwenden denselben Effekt und dieselbe Eingabesperre. Reine Layoutänderungen im Ruhezustand teilen Text ohne neue Schreibanimation und ohne Fokuswechsel um; dies verhindert ein wiederholtes Schließen/Öffnen einer mobilen Bildschirmtastatur. Resize während eines laufenden Aufbaus startet den aktuellen Bildschirm mit neuer Aufteilung und verwirft den überholten Renderlauf. Statusmeldungen werden erst nach Fertigstellung ausgegeben; der Ausgabebereich ist währenddessen mit `aria-busy` markiert.

Lange Ausgaben einschließlich `help` und `list` werden anhand der tatsächlich verfügbaren Höhe und Textbreite aufgeteilt. Navigation über PREVIOUS/NEXT oder PageUp/PageDown; Seitenschalter erscheinen nur bei Bedarf. Schriftgröße und Inhalte werden dafür nicht verkleinert oder gekürzt. Bei Größenwechseln werden die Seiten neu berechnet, der aktuelle Lesebereich wird anhand der Textposition zugeordnet. Bei extrem geringer Höhe bleibt die Ausgabe intern scrollbar. Der echte Close-Link steht rechts unten unter dem Fiktionshinweis und bleibt auch bei geringer Höhe sichtbar.

### Secrets für die Abnahme — Spoiler

Nicht in `help`: `play` (absichtlich Kontaktseite), `chemist` (Sisters-404), `42`, `xyzzy`, `sudo`, `hello`, `wake`, `override`, `108`, `desmond`, `panic` sowie `4 8 15 16 23 42`. `panic` funktioniert erst nach Awakening. Es gibt keinen Alias für den früheren Dialogbefehl und keinen zusätzlichen Terminalbefehl `back`; dieser gilt ausschließlich im Interpreter.

## Zustandsmaschine und Rücksetzen

```text
dormant ── gültiges execute oder wake ──> observing
   │                                       │
   └────── 4 8 15 16 23 42 ─────────────────┴──> awakened
```

Nur die Zahlenfolge aktiviert `awakened`. Ein abgewiesenes oder unbekanntes Archiv aktiviert `observing` nicht. Ein bereits erhöhter Zustand sinkt nicht ab. `reboot` und `clear` ändern ausschließlich die Anzeige. Wiederholter Unlock ist idempotent. Der Interpreter verwendet kurze, feste Keyword-Antworten je Phase. Vor Awakening wird die verborgene Prozesskennung nicht von der Anwendung ausgegeben; `Panic Maru` bleibt der ausdrücklich erlaubte Archivname.

Gespeichert wird ausschließlich `project-tomorrow:story:v1` in `sessionStorage`, mit einem der Werte `dormant`, `observing`, `awakened`. Die Phase übersteht einen Reload im selben Tab. Weder Command-Verlauf noch Nachrichten oder Dialoginhalte werden dort gespeichert. Bei gesperrtem Sitzungsspeicher funktioniert der Besuch mit Zustand im Arbeitsspeicher; Reload stellt ihn dann nicht wieder her.

Für einen reproduzierbaren Neustart auf der **Terminal-Seite** die Browser-Entwicklerkonsole öffnen und ausführen:

```js
sessionStorage.removeItem('project-tomorrow:story:v1');
location.reload();
```

Alternativ den genannten Schlüssel über die Speicheransicht der Entwicklertools löschen und neu laden. Es wurde kein öffentlicher Reset-Command ergänzt.

`exit` öffnet einen eigenen Eingabemodus. Andere Eingaben werden dort nicht als Commands ausgeführt; nur Y oder N beendet die Abfrage. Der sichtbare Rückkehr-Link funktioniert immer. Escape schließt den Composer oder einen Untermodus, anschließend führt Escape aus dem normalen Terminal zur Tech-Seite. Browser-Zurück bleibt verfügbar. Der native Composer-Dialog übernimmt die Fokusbegrenzung; nach Schließen kehrt der Fokus zur Eingabe zurück. Archive erscheinen direkt in der Konsole und werden mit dem nächsten Command ersetzt.

## Verifizierte Verknüpfungen

| Verwendung | Ziel relativ zu `station/` | Nachweis |
| --- | --- | --- |
| Rückkehr | `../tech/index.html` | Datei, Navigation und Tech-Inhalt vorhanden |
| `contact`, `email /urgent`, `play` | `../options/email.html` | Bestehende Kontakt-/Parserseite vorhanden |
| Panic Maru | `../sisters/gigs/2026-brussels-1.html` | Passender Titel und Link auf Sisters-Startseite |
| Kobayashi Maru | `../sisters/gigs/2026-brussels-2.html` | Passender Titel und Link auf Sisters-Startseite |
| Netrunner Guide | `../gaming/cyberpunk2077.html` | Datei und Inhalt vorhanden |
| `chemist` | `https://www.thesistersofmercy.com/error404page.html` | Bereits in `js/email.js` und `options/README.txt`; am 16.10.2026 erfolgreich per HTTPS abgerufen, Titel „Error 404, Page Not Found“, Inhalt „Barely Interactive Fiction“ |
| Blackwall Research | `null`, deaktiviert | Im Repository keine belegte piatkowski.net-Artikel-URL gefunden; technischer Auftrag erlaubt Recherche nur bei Bestandsbeleg |

`chemist` navigiert nach expliziter Eingabe im selben Tab. Archivverweise sind explizit aktivierbare Links im Viewer. Es gibt keine neue Verknüpfung mit `target="_blank"`. Der Blackwall-Viewer nennt den fehlenden geprüften Artikel-Link und erzeugt keine kaputte Navigation. Die bestehende Kontaktseite behält ihre eigene Mailto-Funktion; die neue Station führt selbst keine Nachrichtenzustellung aus.

## Redaktionelle Erweiterung

Jeder Registry-Eintrag besitzt `name`, `slug`, `classification`, `type`, `requiredPhase`, `status`, `pages` und `link`. Die exakte Schreibweise `Cynesure Prototypes` ist verbindlich. Slugs nach Veröffentlichung stabil halten.

`pages` ist ein Array aus redaktionellen Klartextseiten. Der in die Konsole integrierte Viewer erhält diese Seitengrenzen und unterteilt überlange Seiten zusätzlich anhand der verfügbaren Fläche. Previous/Next, PageUp/PageDown und Seitenzähler beziehen sich auf die resultierenden Bildschirmseiten. Keine HTML-Fragmente eintragen. Nach Lieferung finaler Texte beispielsweise `type: 'record'`, `status: 'AVAILABLE'` und die freigegebenen Klartextseiten setzen. Der Zugriff auf The Final Operator bleibt zusätzlich an `requiredPhase: 'awakened'` gebunden.

Vierzehn Einträge haben absichtlich keine Textseiten: Bartmoss Manifest, Soulkiller Protocol, Blackwall Research, Tomorrow Accords, Cynesure Prototypes, Station Orientation, Incident 108, Temporal Drift Report, Operator Handover, Ghost Process, Last Transmission, Project Looking Glass, Avalanche Diagnostic und The Black Tape. Die UI zeigt `ARCHIVE FRAGMENT MISSING` oder `RECORD SEALED`. Panic Maru, Kobayashi Maru und Netrunner Guide enthalten jeweils nur einen kurzen Teaser mit verifiziertem Link und Hinweis auf den unvollständigen Bestand. The Final Operator enthält exakt den gelieferten Text. Es wurden keine weiteren Story-Ereignisse oder Langtexte ergänzt.

Empfohlen ist zuerst eine Freigabe von Station Orientation und Temporal Drift Report als frühe Hinweise, danach die drei langen Kerndossiers und zuletzt eine gemeinsame Prüfung aller Phasen auf Kontinuität und vorzeitige Enthüllungen. Linkfreigaben getrennt dokumentieren; vor Veröffentlichung steht die in der Spezifikation genannte Namens-/Rechteprüfung aus.

## Tests erneut ausführen

Nur mit Python, ohne Paketinstallation:

```sh
python3 tests/station_links.py
```

Zusätzlich mit vorhandenem Node:

```sh
node --test tests/station.test.mjs
```

Optionaler echter Browsertest mit vorhandenem Node **22+** und installiertem Google Chrome, während der lokale Python-Server läuft:

```sh
node tests/station_browser.mjs
```

Keine npm-Pakete erforderlich. Bei anderem Server-Port `STATION_TEST_ORIGIN=http://127.0.0.1:8001 node tests/station_browser.mjs` verwenden. Ein anderer Chrome-Pfad kann über `CHROME_PATH` gesetzt werden. Der Test öffnet ein eigenes temporäres Browserprofil, beendet seinen Browser danach und meldet den temporären Ordner für Screenshots und `results.json`. Der technische Funktionsumfang der Website selbst benötigt Node nicht.

## Manuelle Abnahme

1. Session zurücksetzen; Tech-Seite öffnen; Entry unter dem Footer und Rückkehr prüfen.
2. `help`, `list`, `status`, `version`, `date`, `whoami` ausführen. Genau 18 Lognamen, Final Operator gesperrt, keine enthüllte Prozesskennung.
3. `panic` und eine unbekannte Eingabe testen: jeweils `INVALID INPUT`. `execute "Bartmoss Manifest"` öffnen; ehrlichen Platzhalter direkt in der Konsole prüfen. Der nächste Command ersetzt die Archivansicht.
4. `status`, `hello`, `history`, `ping`, `interpreter` testen. Unregistrierter Prozess, klar fiktionaler Phantom-Eintrag, veränderte Antworten; `back` kehrt zurück.
5. `4 8 15 16 23 42`, danach `status`, `list`, `panic` und `execute the-final-operator`. Freigabe und vorgegebene Schlusszeile prüfen.
6. `reboot`, Reload und `clear` testen: Awakening bleibt erhalten. Pfeiltasten und Entwurfswiederherstellung ausprobieren.
7. `exit`: ungültige Antwort, Y und N prüfen. Echter Rückkehr-Link funktioniert auch während der Abfrage; Escape verlässt Untermodus und danach die Station.
8. `message`: lokalen Hinweis, Pflichtfelder, Vorschau und Schließen prüfen. HTML-artige Eingabe muss Text bleiben. Keine Nachricht wird versandt oder gespeichert.
9. Drei verlinkte Archive, `contact`, `email /urgent`, `play` und `chemist` aktivieren. Browser-Zurück prüfen; Blackwall zeigt keinen ungeprüften Link.
10. Nach mehreren Commands jeweils den Ablauf leerer Screen → sichtbarer Textaufbau → aktive, fokussierte Eingabe prüfen. Währenddessen Enter/RUN mehrfach versuchen: kein zusätzlicher Command. Bei geringer Höhe `list` durchblättern; Eingabe und Footer-Close bleiben sichtbar. Reduced Motion: weiterhin erst leer, dann direkte Ausgabe. Auf Safari/macOS sowie möglichst einem echten iPhone/Android-Gerät Tastatur, Softkeyboard, Tab-Reihenfolge und Pagination prüfen. Diese Geräteabnahme ergänzt die automatisierte Chrome-Emulation.

GitHub bleibt Source of Truth, GitHub Pages Preview/Fallback und IONOS Produktionshosting. Keine Pipeline, kein Push und kein Deployment wurden eingerichtet oder ausgeführt.
