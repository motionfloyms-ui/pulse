# Pulse

Persönliche App für Tag, Lebensräume und Körper. Läuft komplett im Browser; alle Daten bleiben auf dem Gerät: im localStorage, und wenn der voll wird automatisch in IndexedDB. Fotos und die täglichen Sicherungen (Zeitreise, 14 Tage) liegen in IndexedDB. Ein Backup außerhalb des Handys entsteht über „Backup teilen“.

Online: https://motionfloyms-ui.github.io/pulse/

Der Kalender ist ein Terminkalender (Wiederholungen, ganztägig und mehrtägig, Erinnerungen solange die App offen ist, .ics-Import aus Google Kalender und Export) mit einem Almanach pro Tag: Mondphase und Mondzeichen (Meeus), Planetentag und Planetenstunden, 28 Mondstationen, Tarot-Zuordnungen des Golden Dawn, Feste mehrerer Traditionen, Rauhnächte, Baumkalender, chinesischer Mondkalender und 24 Jahresabschnitte. Alles wird lokal berechnet, ohne Netz.

Die Eingabezeile versteht Alltagsdeutsch: „Zahnarzt Freitag 15–16 Uhr“, „Mama Geburtstag jährlich am 3. Mai“, „Probe jeden Dienstag 19 Uhr bis Ende Juni“, „Gesang alle 2 Wochen am Donnerstag, Erinnerung 1 Stunde vorher“, „Stammtisch jeden dritten Donnerstag im Monat“. Datum, Uhrzeit und Wiederholung landen in den Feldern, der Titel bleibt kurz („Probe“).

Der Stapel ersetzt den endlosen Feed: jeden Tag eine feste Zahl Karten (8 bis 20), danach ist Schluss bis morgen. Er mischt über hundert eigene Texte zu Bewusstsein, Physik und Kosmos, Tarot und Magie, Gesang, Kunst und Schreiben (jede Karte mit generiertem Bild), Videos aus der eigenen Sammlung, eine Tarotkarte zum Lernen, den Himmel des Tages und alte eigene Notizen. Behaltene Karten bekommen Sammlernummern. YouTube-Playlists kommen per Google-Takeout-ZIP herein (ohne Entpacken, jede Liste ein Regal, rückgängig machbar).

Dazu: Sigillen-Werkstatt (Buchstabenrad oder Saturnquadrat, Laden im Vollbild, Vergessen, Ergebnis), Song-Werkstatt (Gesangskarte pro Zeile, Bühnenmodus, Takes, Referenzvideos, Metronom, Einsing-Routine), Cut-up-Maschine, Klangraum (Rauschen, Regen, Meer, Drone per Web Audio) und „Dein Himmel“ mit Abzeichen ohne Streaks, 90-Tage-Leuchten und Tarot-Sammlung. Der Videos-Tab sammelt YouTube-Videos und Playlists mit Sammlernummer, Regalen, Merkliste, Favoriten und gemerkten Stellen. Abgespielt wird erst nach einem Tipp, über youtube-nocookie.com; Vorschaubilder und Titel lassen sich in den Einstellungen abschalten.

## Aufbau

- `src/js/` – Module (Domäne ohne DOM, UI, Speicher, Migrationen); Reihenfolge in `src/manifest.json`
- `src/styles/` – ein Stylesheet plus eingebettete Schrift
- `src/index.html` – Markup
- `build.mjs` – erzeugt daraus die einzelne Datei `index.html` (keine Abhängigkeiten)
- `tests/` – `node:test` für Stapel, Takeout-Import, Datenmodell, Erkennung, Körper, Bibliothek, Kalender, Termine, .ics, Sigillen, Songs, Cut-up, Himmel, Videos, Videosammlung, Speicher und Migrationen

```
npm run check   # bauen, Bundle prüfen, Tests
npm run e2e     # Browser-Test: Hauptabläufe und jeder Knopf jeder Ansicht (braucht playwright)
```

Testdaten sind erfunden. Persönliche Daten gehören nie ins Repository, sie kommen über das Backup in die App.
