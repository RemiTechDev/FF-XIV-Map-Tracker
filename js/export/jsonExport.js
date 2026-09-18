// ============================================================================
// Dependencies
// ============================================================================
import { APP_VERSION, SCHEMA_VERSION } from "../storage.js";
import { datedBaseName, downloadBlob } from "./download.js";

// ============================================================================
// Backup payload
// ============================================================================
export function createBackupPayload(appData) {
    return {
        schemaVersion: SCHEMA_VERSION,
        appVersion: APP_VERSION,
        exportedAt: new Date().toISOString(),
        settings: { ...appData.settings },
        sessions: appData.sessions.map(session => ({ ...session }))
    };
}

// ============================================================================
// JSON file creation
// ============================================================================
export function createJsonBlob(appData) {
    return new Blob([JSON.stringify(createBackupPayload(appData), null, 2)],
        { type: "application/json;charset=utf-8" });
}

export function exportJson(appData) {
    downloadBlob(createJsonBlob(appData), `${datedBaseName()}_backup.json`);
}

// ============================================================================
// JSON restore helper
// ============================================================================
export async function readJsonFile(file) {
    const text = await file.text();
    return JSON.parse(text);
}
