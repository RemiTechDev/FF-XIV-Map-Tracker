# Exports and Backups

FFXIV Map Tracker is hosted as a static application on **GitHub Pages**.

The application source is not part of user backups. Export and import features operate only on the tracker data stored in the browser.

The formats have separate purposes:

- **XLSX / ODS** → reports,
- **CSV** → raw analysis data,
- **JSON** → restorable tracker data,
- **ZIP** → a data-only package containing all export formats.

## GitHub Pages vs user data

The application code is served by GitHub Pages. Live tracker data is stored in browser `localStorage`.

Updating the repository or deploying a new version to the same GitHub Pages site does not require exporting and re-importing the application files. The user only needs backups when moving data to another browser/device or before clearing site storage.

## XLSX report

Generated with **ExcelJS**.

Worksheets:

- `Dashboard`
- `Sessions`
- `Maps`
- `Levels`
- `Finances`
- `Map Database`
- `Info`

The Dashboard includes chart images generated from the current tracker data. The source numbers remain available in worksheet cells.

## ODS

ODS is generated for **LibreOffice Calc** and contains structured report sheets based on the same local tracker data.

## CSV

CSV contains raw session rows and is intended for analysis in Excel, LibreOffice, Python, R, Power BI or custom scripts.

CSV is not used for restoring the application state.

## JSON backup

JSON is the only import/restore format.

Example:

```json
{
  "schemaVersion": 4,
  "appVersion": "0.4.0",
  "exportedAt": "2026-09-18T18:00:00.000Z",
  "settings": {
    "language": "PL",
    "compactMode": false
  },
  "sessions": []
}
```

Use JSON when:

- moving to another browser or device,
- protecting data before clearing site storage,
- restoring the tracker after a browser reset,
- keeping a long-term backup of session history and settings.

The current importer expects `schemaVersion: 4`.

## Data package ZIP

The **Download data package** action creates a flat ZIP containing only generated user-data files:

```text
FFXIV_Map_Tracker_Data_<date>.zip
├── FFXIV_Map_Tracker_Data_<date>_report.xlsx
├── FFXIV_Map_Tracker_Data_<date>_report.ods
├── FFXIV_Map_Tracker_Data_<date>_sessions.csv
└── FFXIV_Map_Tracker_Data_<date>_backup.json
```

It intentionally does **not** contain:

- `index.html`,
- `styles.css`,
- JavaScript source files,
- icons,
- the service worker,
- README or documentation files.

Those files already live in the GitHub repository / GitHub Pages deployment.

## Recommended format

| Goal | Format |
| --- | --- |
| Restore or move tracker data | **JSON** |
| Open a polished spreadsheet report | **XLSX** |
| Work mainly in LibreOffice | **ODS** |
| Analyze raw session rows | **CSV** |
| Download every data format at once | **ZIP** |

## Backup recommendation

A practical routine is:

1. use the GitHub Pages app normally,
2. periodically download a JSON backup,
3. optionally download the data ZIP when you also want spreadsheet reports,
4. keep at least one backup outside the browser profile.

## Legacy V3 records

Migrated V3 sessions can contain:

```json
{
  "date": null,
  "spentGil": 0,
  "source": "legacy-v3"
}
```

This is intentional. The old storage format did not preserve historical dates or purchase costs, so exports must not invent those values.
