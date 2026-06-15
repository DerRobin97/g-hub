# Design-Dokumentation (1:1-Referenz)

Diese Dateien sind die verbindliche **Design-/Animations-Referenz** für G-Hub und
liegen jetzt versioniert im Repo (vorher extern unter `Downloads/G-Hub Doku`).
Damit muss in neuen Sessions **nichts mehr verlinkt** werden.

- `G-Hub Design-Dokumentation.html` — vollständige Spezifikation (Farben/Themes,
  Typografie, Splash-Animation, Bewegungssprache, Komponenten, Shell/Navigation,
  Seiten, Sheets, KI, iPad-Querformat, Datenmodell). Im Browser öffnen.
- `quelldateien/` — direkt nachnutzbare Originaldateien:
  - `styles.css`, `jahresplan.css`, `gerberhub-loader.js` — **byte-identisch** bereits
    unter `frontend/src/styles/` bzw. `frontend/public/` migriert.
  - `appearance.js`, `icons.jsx`, `data.js` — Tokens/Icons/Mock-Daten als Referenz.

Hinweis: Die CSS ist 1:1 zu übernehmen — beim Portieren keine neuen CSS-Regeln,
nur Prototyp-`className`s + Inline-Styles exakt übernehmen. Ausnahme laut Übergabe:
die **mobile Bottom-Nav** darf eine eigene, dedizierte Komponente mit eigenem,
sauberem CSS bekommen (siehe `../../NEXT_STEPS.md`, Abschnitt „Session-Update 2026-06-15").
