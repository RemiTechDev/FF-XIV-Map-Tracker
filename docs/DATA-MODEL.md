# V4 Data Model

This document describes the storage model used by **FFXIV Map Tracker v0.4.0**.

## Overview

V4 uses a **session-based model**. A session is the source record for one saved Treasure Map run.

Statistics, map totals, level totals, portal rates and financial results are calculated from the session list instead of being stored as independent permanent totals.

The application is local-first and stores its current state in browser `localStorage`.

## Storage keys

Current V4 key:

```text
FFXIV_MAP_TRACKER_APP_V4
```

Legacy keys used during migration:

```text
FFXIV_MAP_TRACKER_DATA_V3
FFXIV_MAP_TRACKER_SESSIONS_V3
```

## Application object

```json
{
  "schemaVersion": 4,
  "appVersion": "0.4.0",
  "settings": {
    "language": "PL",
    "compactMode": false
  },
  "sessions": []
}
```

## Session object

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-09-18",
  "mapId": "braaxskin",
  "maps": 4,
  "portals": 2,
  "clears": 1,
  "earnedGil": 850000,
  "spentGil": 320000,
  "note": "Weekend party run",
  "createdAt": "2026-09-18T18:00:00.000Z",
  "source": "manual"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Unique session identifier. |
| `date` | `YYYY-MM-DD` or `null` | Run date. Legacy records can have no known date. |
| `mapId` | string | ID referencing the map database. |
| `maps` | integer | Completed maps in the session. |
| `portals` | integer | Opened treasure dungeon portals. |
| `clears` | integer | Dungeon clears. |
| `earnedGil` | integer | Total Gil earned. |
| `spentGil` | integer | Total recorded map purchase cost. |
| `note` | string | Optional session note. |
| `createdAt` | ISO timestamp | Tracker record creation time. |
| `source` | string | `manual` or `legacy-v3`. |

## Map database

Maps are defined in `js/mapsData.js`.

```js
{
    id: "braaxskin",
    name: "Br'aaxskin Map",
    level: 100,
    type: "Party",
    dungeon: "Cenote Ja Ja Gbal",
    portalEligible: true
}
```

### Important distinction

`type: "Party"` does **not** automatically mean `portalEligible: true`.

Portal calculations use the explicit `portalEligible` property.

## Calculations

### Session profit

```text
session profit = earnedGil - spentGil
```

### Total net profit

```text
net profit = total Gil earned - total Gil spent
```

### Portal rate

```text
portal rate =
opened portals
------------------------------ × 100
completed portal-eligible maps
```

### Dungeon clear rate

```text
clear rate =
dungeon clears
-------------- × 100
opened portals
```

### Average profit per map

```text
average profit per map =
net profit
----------------
completed maps
```

## Aggregation

`js/calculations.js` provides:

- `calculateTotals()` — all-session KPI totals,
- `aggregateByMap()` — statistics grouped by map,
- `aggregateByLevel()` — statistics grouped by level,
- `aggregateByDate()` — daily data used by time-series reporting,
- `filterSessions()` — time and level filtering.

Unknown-date legacy sessions remain part of all-time aggregation but are excluded from date-based charts and date-limited filters.

## Validation

Storage sanitization:

- rejects unknown map IDs,
- clamps numeric values to non-negative values,
- converts map/portal/clear counts to integers,
- rounds Gil values,
- validates `YYYY-MM-DD` dates,
- limits notes to 300 characters,
- assigns a unique ID when needed,
- normalizes imported V4 backups.

## V3 migration

V3 stored map-level aggregate totals, not complete historical sessions.

During migration, one legacy session is created for each map with non-zero totals.

The V3 format did not preserve the original date of every run or historical map purchase costs. Those values cannot be reconstructed safely, so migrated records use:

```json
{
  "date": null,
  "spentGil": 0,
  "source": "legacy-v3"
}
```

## Backup compatibility

JSON restore currently expects:

```text
schemaVersion = 4
```

Future schema versions should use explicit migration logic rather than silently importing incompatible backups.
