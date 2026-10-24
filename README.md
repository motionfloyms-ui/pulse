# Pulse

Persönliche App für Tag, Lebensräume und Körper. Läuft komplett im Browser; alle Daten bleiben auf dem Gerät: im localStorage, und wenn der voll wird automatisch in IndexedDB. Fotos und die täglichen Sicherungen (Zeitreise, 14 Tage) liegen in IndexedDB. Ein Backup außerhalb des Handys entsteht über „Backup teilen“.

Online: https://motionfloyms-ui.github.io/pulse/

Der Kalender ist ein Terminkalender (Wiederholungen, ganztägig und mehrtägig, Erinnerungen solange die App offen ist, .ics-Import aus Google Kalender und Export) mit einem Almanach pro Tag: Mondphase und Mondzeichen (Meeus), Planetentag und Planetenstunden, 28 Mondstationen, Tarot-Zuordnungen des Golden Dawn, Feste mehrerer Traditionen, Rauhnächte, Baumkalender, chinesischer Mondkalender und 24 Jahresabschnitte. Alles wird lokal berechnet, ohne Netz.

Die Eingabezeile versteht Alltagsdeutsch: „Zahnarzt Freitag 15–16 Uhr“, „Mama Geburtstag jährlich am 3. Mai“, „Probe jeden Dienstag 19 Uhr bis Ende Juni“, „Gesang alle 2 Wochen am Donnerstag, Erinnerung 1 Stunde vorher“, „Stammtisch jeden dritten Donnerstag im Monat“. Datum, Uhrzeit und Wiederholung landen in den Feldern, der Titel bleibt kurz („Probe“).

Der Stapel ersetzt den endlosen Feed: jeden Tag eine feste Zahl Karten (8 bis 20), danach ist Schluss bis morgen. Er mischt über hundert eigene Texte zu Bewusstsein, Physik und Kosmos, Tarot und Magie, Gesang, Kunst und Schreiben (jede Karte mit generiertem Bild), Videos aus der eigenen Sammlung, eine Tarotkarte zum Lernen, den Himmel des Tages und alte eigene Notizen. Dazu täglich echte Bilder und Texte: das Astronomiebild der NASA, Bild und Artikel des Tages der deutschen Wikipedia und ein gemeinfreies Kunstwerk des Art Institute of Chicago (abschaltbar; gesendet wird nur die Adresse des Tages). Behaltene Karten bekommen Sammlernummern. YouTube-Playlists kommen per Google-Takeout-ZIP herein (ohne Entpacken, jede Liste ein Regal, rückgängig machbar).

Der Himmelsraum ist ein ruhiger runder Raum in 3D, am Handy zum Umschauen und auf der Meta Quest als WebXR-Raum („In VR betreten“ im Quest-Browser). Er steht auf einer Lichtung über dem Meer, hinten Berge. Der Himmel folgt der echten Zeit in Wuppertal: Sonnenstand, Dämmerung, die Sterne der Nacht (helle Sterne an ihrem echten Ort, Milchstraße) und der Mond in seiner echten Phase; Morgen, Tag, Abend und Nacht lassen sich auch einstellen. Dazu Klang, eine Atemkugel (4 Sekunden ein, 6 aus), links eine Tarotecke (Tageskarte, drei Karten), rechts eine Sigillenecke (laden mit Drone und Fortschrittsring, vergessen löst die Sigille in Licht auf) und ein Notizbuch: In VR wird mit gedrücktem Trigger oder Daumen und Zeigefinger in die Luft geschrieben, die Lichtschrift landet als Seite im Buch (gespeichert als Notiz mit Bild); getippt wird über eine Tastatur im Raum, am Handy mit dem Finger oder im Textfeld. three.js (MIT) liegt in `vendor/three` und wird erst beim Öffnen des Raums geladen.

Handy und Quest haben je einen eigenen Speicher. „Mit anderem Gerät abgleichen“ (Einstellungen, Mehr oder im Himmelsraum) bringt beide auf denselben Stand: Auf einem Gerät entsteht ein Paket (Einträge mit Notizbuchseiten und Bildern, Sigillen, Tarot, Videos, behaltene Karten), das andere führt es zusammen, statt etwas zu ersetzen. Neues kommt dazu, von zwei Fassungen gilt die neuere, Sigillen-Ladungen werden zusammengezählt, Gelöschtes reist als Grabstein mit und bleibt gelöscht. Körperdaten und Songtexte bleiben auf dem Gerät. Vorher legt PULSE eine Sicherung in der Zeitreise an; auch ein normales Backup lässt sich so zusammenführen.

Dazu: Sigillen-Werkstatt (Buchstabenrad oder Saturnquadrat, Laden im Vollbild, Vergessen, Ergebnis), Song-Werkstatt (Gesangskarte pro Zeile, Bühnenmodus, Takes, Referenzvideos, Metronom, Einsing-Routine), Cut-up-Maschine, Klangraum (Rauschen, Regen, Meer, Drone per Web Audio) und „Dein Himmel“ mit Abzeichen ohne Streaks, 90-Tage-Leuchten und Tarot-Sammlung. Der Videos-Tab sammelt YouTube-Videos und Playlists mit Sammlernummer, Regalen, Merkliste, Favoriten und gemerkten Stellen. Abgespielt wird erst nach einem Tipp, über youtube-nocookie.com; Vorschaubilder und Titel lassen sich in den Einstellungen abschalten.

## Aufbau

- `src/js/` – Module (Domäne ohne DOM, UI, Speicher, Migrationen); Reihenfolge in `src/manifest.json`
- `src/styles/` – ein Stylesheet plus eingebettete Schrift
- `src/index.html` – Markup
- `build.mjs` – erzeugt daraus die einzelne Datei `index.html` (keine Abhängigkeiten)
- `vendor/three/` – three.js r185 (MIT-Lizenz), nur für den Himmelsraum
- `tests/` – `node:test` für Abgleich, Sonnen- und Mondstand, Stapel, Takeout-Import, Datenmodell, Erkennung, Körper, Bibliothek, Kalender, Termine, .ics, Sigillen, Songs, Cut-up, Himmel, Videos, Videosammlung, Speicher und Migrationen

```
npm run check   # bauen, Bundle prüfen, Tests
npm run e2e     # Browser-Test: Hauptabläufe, simulierte VR-Sitzung und jeder Knopf jeder Ansicht (braucht playwright)
```

Testdaten sind erfunden. Persönliche Daten gehören nie ins Repository, sie kommen über das Backup in die App.
