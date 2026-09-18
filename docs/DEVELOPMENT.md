# Development Guide

This document describes the structure and development workflow for **FFXIV Map Tracker v0.4.0**.

## Requirements

The application itself does not require Node.js, Python, a backend server or a build step.

It uses:

- HTML
- CSS
- Vanilla JavaScript
- ES Modules

A local HTTP server is recommended because the project uses JavaScript modules and a service worker.

## Recommended workflow

### VS Code + Live Server

1. Open the repository in VS Code.
2. Install **Live Server** if needed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. Use the address shown by the extension.

Example:

```text
http://127.0.0.1:5500/
```

### Alternative

Any static HTTP server works.

For example, if Python is already installed:

```bash
python -m http.server 8080
```

Python is **not** a project dependency. It is only an optional local server.

## Project structure

```text
FF-XIV-Map-Tracker/
├── assets/
│   └── icons/
├── docs/
├── js/
│   ├── export/
│   ├── statistics/
│   ├── app.js
│   ├── calculations.js
│   ├── i18n.js
│   ├── mapsData.js
│   └── storage.js
├── index.html
├── manifest.json
├── styles.css
├── sw.js
└── README.md
```

## File responsibilities

### `index.html`

Application shell and the Tracker, Statistics, Guide and About views.

### `styles.css`

Layout, cards, tables, forms, navigation, chart containers and responsive breakpoints.

Avoid rigid content widths where tables or canvases can overflow. Use `minmax()` and `min-width: 0` for flexible grid columns.

### `js/app.js`

Main UI/controller layer:

- application startup,
- forms,
- navigation,
- rendering,
- session edit/delete,
- statistics filters,
- export/import actions.

### `js/mapsData.js`

Treasure Map reference database.

Each entry defines:

```js
{
    id,
    name,
    level,
    type,
    dungeon,
    portalEligible
}
```

`portalEligible` must be explicit and should not be inferred only from `type`.

### `js/calculations.js`

Business calculations and aggregation:

- totals,
- grouping by map,
- grouping by level,
- grouping by date,
- profit,
- filtering,
- number formatting.

New statistics should be implemented here before being added to charts or DOM rendering.

### `js/storage.js`

Persistent V4 state:

- schema/app version,
- localStorage,
- V3 migration,
- sanitization,
- add/update/delete,
- settings,
- backup replacement.

### `js/i18n.js`

Polish, English and French UI dictionaries.

Every new visible label should be added to each supported language.

### `js/statistics/charts.js`

Chart.js rendering.

Charts should consume calculated data and should not become a second source of business logic.

### `js/export/`

- `download.js` — filenames and browser downloads.
- `csvExport.js` — raw sessions.
- `jsonExport.js` — backup payload and JSON parsing.
- `excelExport.js` — styled XLSX report.
- `odsExport.js` — ODS workbook.
- `bundleExport.js` — complete ZIP bundle.

## Adding a map

Edit `js/mapsData.js`.

```js
{
    id: "example-map",
    name: "Example Map",
    level: 100,
    type: "Party",
    dungeon: "Example Dungeon",
    portalEligible: true
}
```

Rules:

- keep `id` unique and stable,
- use a numeric `level`,
- set `dungeon: null` if no treasure dungeon exists,
- set `portalEligible` based on actual portal behavior,
- do not rename an existing ID after users have stored sessions referencing it.

## Adding a statistic

1. Add the formula/aggregation to `js/calculations.js`.
2. Add its UI or chart.
3. Add it to exports when useful.
4. Add translations to `js/i18n.js`.
5. Document the formula in `DATA-MODEL.md`.

## Schema migrations

For future schema changes:

1. increment the schema version,
2. create explicit migration logic,
3. preserve existing data where possible,
4. never invent missing historical values,
5. update JSON import validation,
6. document the change in `CHANGELOG.md`.

## Service worker note

Browser service worker caching can make old assets appear to remain after code changes.

During development, if stale files are shown:

- unregister the service worker in browser developer tools, or
- clear site data,
- then reload through the local HTTP server.

## Manual release checklist

Test:

- add session,
- edit session,
- delete session,
- reset data,
- Solo map,
- portal-eligible Party map,
- Party map without portal,
- zero-value fields,
- statistics filters,
- charts with and without data,
- CSV,
- XLSX,
- ODS,
- JSON export,
- JSON restore,
- data package ZIP,
- V3 migration,
- desktop/tablet/mobile layout,
- PWA behavior.

## Browser requirements

Use a modern browser supporting:

- ES Modules,
- localStorage,
- Blob/File APIs,
- CSS Grid/Flexbox,
- Service Workers.

PWA service workers require a secure context such as HTTPS; `localhost` is treated specially for local development.
