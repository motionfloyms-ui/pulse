# Pulse

Persönliche App für Tag, Lebensräume und Körper. Läuft komplett im Browser; alle Daten bleiben auf dem Gerät (localStorage, Fotos in IndexedDB).

Online: https://motionfloyms-ui.github.io/pulse/

Der Kalender rechnet Mondphasen (Meeus), die 24 Jahresabschnitte und den chinesischen Mondkalender (Ortszeit Peking) selbst aus, ohne Netz. Der Videos-Tab sammelt YouTube-Videos und Playlists mit Sammlernummer, Regalen, Merkliste, Favoriten und gemerkten Stellen. Abgespielt wird erst nach einem Tipp, über youtube-nocookie.com; Vorschaubilder und Titel lassen sich in den Einstellungen abschalten.

## Aufbau

- `src/js/` – Module (Domäne ohne DOM, UI, Speicher, Migrationen); Reihenfolge in `src/manifest.json`
- `src/styles/` – ein Stylesheet plus eingebettete Schrift
- `src/index.html` – Markup
- `build.mjs` – erzeugt daraus die einzelne Datei `index.html` (keine Abhängigkeiten)
- `tests/` – `node:test` für Datenmodell, Erkennung, Körper, Bibliothek, Kalender, Videos, Videosammlung, Speicher und Migrationen

```
npm run check   # bauen, Bundle prüfen, Tests
```

Testdaten sind erfunden. Persönliche Daten gehören nie ins Repository, sie kommen über das Backup in die App.
