// ============================================================================
// Dependencies
// ============================================================================
import { createCsvBlob } from "./csvExport.js";
import { createJsonBlob } from "./jsonExport.js";
import { createOdsBlob } from "./odsExport.js";
import { createExcelBlob } from "./excelExport.js";
import { datedBaseName, downloadBlob } from "./download.js";

// ============================================================================
// Data-only ZIP export
// ============================================================================
// GitHub Pages already hosts the application itself. This ZIP intentionally
// contains only the user's reports and backup data — never HTML, CSS, JS,
// icons or any other application source files.
export async function exportDataPackage(appData) {
    if (!window.JSZip) {
        throw new Error("JSZip is not loaded.");
    }

    const zip = new JSZip();
    const base = datedBaseName("FFXIV_Map_Tracker_Data");

    const [xlsx, ods, csv, json] = await Promise.all([
        createExcelBlob(appData),
        Promise.resolve(createOdsBlob(appData)),
        Promise.resolve(createCsvBlob(appData.sessions)),
        Promise.resolve(createJsonBlob(appData))
    ]);

    // Keep the archive flat and data-only. This makes it obvious that the ZIP
    // is a user-data package, not a copy of the GitHub Pages application.
    zip.file(`${base}_report.xlsx`, xlsx);
    zip.file(`${base}_report.ods`, ods);
    zip.file(`${base}_sessions.csv`, csv);
    zip.file(`${base}_backup.json`, json);

    const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
    });

    downloadBlob(blob, `${base}.zip`);
}
