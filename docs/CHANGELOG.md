# Changelog

All notable changes to **FFXIV Map Tracker** are documented in this file.

The project currently uses a simple versioning scheme. Version `0.4.0` is the first release based on the new session-oriented data model.

## [0.4.0] - 2026-09-18

### Added

- New navigation with four main views: Tracker, Statistics, Guide and About.
- Session-based storage model.
- Session history with edit and delete actions.
- Per-session map purchase cost tracking.
- Net profit and average profit per map.
- Dedicated `portalEligible` field in the map database.
- Statistics filters by time period and map level.
- Charts for maps/portals by level, Gil over time, profit by map and portal rate by map.
- XLSX export with multiple worksheets and Dashboard chart images.
- ODS export for LibreOffice Calc.
- CSV raw session export.
- JSON backup export and restore.
- Data-only ZIP export package containing XLSX, ODS, CSV and JSON.
- Responsive desktop, tablet and mobile layout.
- Local PWA icons and updated manifest.
- Automatic V3 → V4 migration.

### Changed

- Statistics are derived from session history instead of being stored primarily as map totals.
- `Party` and `portal eligible` are no longer treated as equivalent concepts.
- Portal rate is calculated only from completed portal-eligible maps.
- Dungeon clear rate is calculated from opened portals.
- Financial reporting separates Gil earned, Gil spent and net profit.
- Technical documentation moved to `docs/`, leaving the main README as the repository overview.

### Fixed

- XLSX and the data ZIP package no longer fail with `row.cells is not iterable`; header styling now uses the supported ExcelJS `row.eachCell()` API.
- Service worker cache name was refreshed so browsers fetch the corrected export module.
- Responsive layout problems caused by rigid grid widths.
- Content overflow in narrow layouts.
- Missing practical behavior for editing and deleting individual entries.
- Incorrect assumptions that every Party map has a treasure dungeon portal.
- Inconsistent PWA configuration.

### Migration notes

V3 stored aggregate totals per map and did not retain complete historical session information.

During migration:

- existing totals are converted into legacy sessions,
- original dates cannot be recovered and are stored as unknown,
- historical map purchase costs cannot be recovered and default to `0`,
- legacy entries without a known date remain part of all-time totals,
- entries without a date are excluded from time-series charts.

## Earlier versions

Earlier repository revisions used the V3 aggregate model and provided the original map tracking, Gil totals, portal statistics and chart visualization.

Because those revisions did not maintain a formal release changelog, this file intentionally does not assign invented historical version numbers.
