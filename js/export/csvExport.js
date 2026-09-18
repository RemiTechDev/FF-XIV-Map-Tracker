// ============================================================================
// Dependencies
// ============================================================================
import { getMapById } from "../mapsData.js";
import { sessionProfit } from "../calculations.js";
import { datedBaseName, downloadBlob } from "./download.js";

// ============================================================================
// CSV escaping
// ============================================================================
function escapeCsv(value) {
    const text = value == null ? "" : String(value);
    return /[",\n\r;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// ============================================================================
// CSV creation
// ============================================================================
export function createCsvBlob(sessions = []) {
    const header = [
        "date",
        "map_id",
        "map_name",
        "level",
        "type",
        "portal_eligible",
        "maps",
        "portals",
        "clears",
        "earned_gil",
        "spent_gil",
        "profit_gil",
        "note",
        "source"
    ];
    const rows = sessions.map(session => {
        const map = getMapById(session.mapId);
        return [
            session.date ?? "",
            session.mapId,
            map?.name ?? session.mapId,
            map?.level ?? "",
            map?.type ?? "",
            map?.portalEligible ? "true" : "false",
            session.maps,
            session.portals,
            session.clears,
            session.earnedGil,
            session.spentGil,
            sessionProfit(session),
            session.note ?? "",
            session.source ?? "manual"
        ];
    });
    const csv = [header, ...rows].map(row => row.map(escapeCsv).join(",")).join("\r\n");
    return new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
}

// ============================================================================
// Browser download
// ============================================================================
export function exportCsv(sessions = []) {
    const blob = createCsvBlob(sessions);
    downloadBlob(blob, `${datedBaseName()}_sessions.csv`);
}
