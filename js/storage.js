// ============================================================================
// Dependencies and storage constants
// ============================================================================
import { MAPS_DATABASE } from "./mapsData.js";

const APP_KEY = "FFXIV_MAP_TRACKER_APP_V4";
const LEGACY_DATA_KEY = "FFXIV_MAP_TRACKER_DATA_V3";
const LEGACY_SESSIONS_KEY = "FFXIV_MAP_TRACKER_SESSIONS_V3";

export const SCHEMA_VERSION = 4;
export const APP_VERSION = "0.4.0";

// ============================================================================
// Normalization helpers
// ============================================================================
function makeId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function sanitizeSession(session = {}) {
    const mapExists = MAPS_DATABASE.some(map => map.id === session.mapId);
    if (!mapExists) return null;
    const date = typeof session.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(session.date) ? session.date : null;

    return {
        id: typeof session.id === "string" && session.id ? session.id : makeId(),
        date,
        mapId: session.mapId,
        maps: Math.floor(safeNumber(session.maps)),
        portals: Math.floor(safeNumber(session.portals)),
        clears: Math.floor(safeNumber(session.clears)),
        earnedGil: Math.round(safeNumber(session.earnedGil)),
        spentGil: Math.round(safeNumber(session.spentGil)),
        note: typeof session.note === "string" ? session.note.slice(0, 300) : "",
        createdAt: typeof session.createdAt === "string" ? session.createdAt : new Date().toISOString(),
        source: session.source === "legacy-v3" ? "legacy-v3" : "manual"
    };
}

// ============================================================================
// Default V4 application state
// ============================================================================
export function createDefaultAppData() {
    return {
        schemaVersion: SCHEMA_VERSION,
        appVersion: APP_VERSION,
        settings: {
            language: "PL",
            compactMode: false
        },
        sessions: []
    };
}

// ============================================================================
// V4 normalization
// ============================================================================
function normalizeAppData(raw) {
    const defaults = createDefaultAppData();
    const sessions = Array.isArray(raw?.sessions)
        ? raw.sessions.map(sanitizeSession).filter(Boolean)
        : [];

    return {
        ...defaults,
        ...raw,
        schemaVersion: SCHEMA_VERSION,
        appVersion: APP_VERSION,
        settings: {
            ...defaults.settings,
            ...(raw?.settings ?? {})
        },
        sessions
    };
}

// ============================================================================
// Legacy V3 migration
// ============================================================================
function migrateV3() {
    const raw = localStorage.getItem(LEGACY_DATA_KEY);
    if (!raw) return null;

    try {
        const legacyData = JSON.parse(raw);
        const sessions = [];

        for (const map of MAPS_DATABASE) {
            const entry = legacyData?.[map.id];
            if (!entry) continue;
            const maps = safeNumber(entry.num_maps);
            const portals = safeNumber(entry.num_portals);
            const clears = safeNumber(entry.num_clears);
            const earnedGil = safeNumber(entry.earned_gil);
            if (maps === 0 && portals === 0 && clears === 0 && earnedGil === 0) continue;

            sessions.push({
                id: makeId(),
                date: null,
                mapId: map.id,
                maps: Math.floor(maps),
                portals: Math.floor(portals),
                clears: Math.floor(clears),
                earnedGil: Math.round(earnedGil),
                spentGil: 0,
                note: "Migrated from V3 aggregate data. Original date and map purchase cost were not available.",
                createdAt: new Date().toISOString(),
                source: "legacy-v3"
            });
        }

        const migrated = createDefaultAppData();
        migrated.sessions = sessions;
        saveAppData(migrated);
        return migrated;
    } catch (error) {
        console.error("V3 migration failed:", error);
        return null;
    }
}

// ============================================================================
// Public storage API
// ============================================================================
export function loadAppData() {
    try {
        const raw = localStorage.getItem(APP_KEY);
        if (raw) return normalizeAppData(JSON.parse(raw));
        return migrateV3() ?? createDefaultAppData();
    } catch (error) {
        console.error("Could not load local data:", error);
        return createDefaultAppData();
    }
}

export function saveAppData(data) {
    const normalized = normalizeAppData(data);
    localStorage.setItem(APP_KEY, JSON.stringify(normalized));
    return normalized;
}

export function clearAppData() {
    localStorage.removeItem(APP_KEY);
    localStorage.removeItem(LEGACY_DATA_KEY);
    localStorage.removeItem(LEGACY_SESSIONS_KEY);
}

export function addSession(appData, session) {
    const clean = sanitizeSession({ ...session, id: makeId(), createdAt: new Date().toISOString(), source: "manual" });
    if (!clean) throw new Error("Unknown map.");
    appData.sessions.unshift(clean);
    return saveAppData(appData);
}

export function updateSession(appData, sessionId, patch) {
    const index = appData.sessions.findIndex(session => session.id === sessionId);
    if (index === -1) return appData;
    const updated = sanitizeSession({ ...appData.sessions[index], ...patch, id: sessionId });
    if (!updated) throw new Error("Invalid session data.");
    appData.sessions[index] = updated;
    return saveAppData(appData);
}

export function deleteSession(appData, sessionId) {
    appData.sessions = appData.sessions.filter(session => session.id !== sessionId);
    return saveAppData(appData);
}

export function replaceAppData(imported) {
    if (!imported || Number(imported.schemaVersion) !== SCHEMA_VERSION || !Array.isArray(imported.sessions)) {
        throw new Error("This is not a valid FFXIV Map Tracker V4 backup.");
    }
    return saveAppData(imported);
}

export function setSettings(appData, patch) {
    appData.settings = { ...appData.settings, ...patch };
    return saveAppData(appData);
}
