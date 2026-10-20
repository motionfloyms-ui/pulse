# Pulse

Persönliche App für Tag, Lebensräume und Körper. Läuft komplett im Browser; alle Daten bleiben auf dem Gerät (localStorage, Fotos in IndexedDB).

Online: https://motionfloyms-ui.github.io/pulse/

## Aufbau

- `src/js/` – Module (Domäne ohne DOM, UI, Speicher, Migrationen); Reihenfolge in `src/manifest.json`
- `src/styles/` – ein Stylesheet plus eingebettete Schrift
- `src/index.html` – Markup
- `build.mjs` – erzeugt daraus die einzelne Datei `index.html` (keine Abhängigkeiten)
- `tests/` – `node:test` für Datenmodell, Erkennung, Körper, Bibliothek, Speicher und Migrationen

```
npm run check   # bauen, Bundle prüfen, Tests
```

Testdaten sind erfunden. Persönliche Daten gehören nie ins Repository, sie kommen über das Backup in die App.
