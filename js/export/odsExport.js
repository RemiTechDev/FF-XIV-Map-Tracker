// ============================================================================
// Dependencies
// ============================================================================
import { MAPS_DATABASE, getMapById } from "../mapsData.js";
import {
    aggregateByLevel,
    aggregateByMap,
    calculateTotals,
    sessionProfit
} from "../calculations.js";
import { datedBaseName, downloadBlob } from "./download.js";

// ============================================================================
// SheetJS guard
// ============================================================================
function ensureXlsx() {
    if (!window.XLSX) {
        throw new Error("SheetJS is not loaded.");
    }
}

// ============================================================================
// Row mappers
// ============================================================================
function sessionToRow(session) {
    const map = getMapById(session.mapId);

    return {
        Date: session.date ?? "Legacy / unknown",
        Map: map?.name ?? session.mapId,
        Level: map?.level ?? "",
        Type: map?.type ?? "",
        Maps: session.maps,
        Portals: session.portals,
        Clears: session.clears,
        "Gil Earned": session.earnedGil,
        "Gil Spent": session.spentGil,
        "Net Profit": sessionProfit(session),
        Note: session.note ?? "",
        Source: session.source ?? "manual"
    };
}

function mapStatsToRow(row) {
    return {
        Map: row.name,
        Level: row.level,
        Type: row.type,
        "Portal Eligible": row.portalEligible ? "Yes" : "No",
        Dungeon: row.dungeon ?? "",
        Maps: row.maps,
        Portals: row.portals,
        "Portal Rate": row.portalRate / 100,
        Clears: row.clears,
        "Gil Earned": row.earnedGil,
        "Gil Spent": row.spentGil,
        "Net Profit": row.profitGil
    };
}

function levelStatsToRow(row) {
    return {
        Level: row.level,
        Maps: row.maps,
        "Portal Eligible Maps": row.portalEligibleMaps,
        Portals: row.portals,
        "Portal Rate": row.portalRate / 100,
        Clears: row.clears,
        "Clear Rate": row.clearRate / 100,
        "Gil Earned": row.earnedGil,
        "Gil Spent": row.spentGil,
        "Net Profit": row.profitGil
    };
}

function mapDatabaseToRow(map) {
    return {
        ID: map.id,
        Map: map.name,
        Level: map.level,
        Type: map.type,
        "Portal Eligible": map.portalEligible ? "Yes" : "No",
        Dungeon: map.dungeon ?? ""
    };
}

// ============================================================================
// ODS workbook creation
// ============================================================================
export function createOdsBlob(appData) {
    ensureXlsx();

    const workbook = XLSX.utils.book_new();
    const totals = calculateTotals(appData.sessions);
    const mapRows = aggregateByMap(appData.sessions);
    const levelRows = aggregateByLevel(appData.sessions);

    // ------------------------------------------------------------------------
    // Dashboard
    // ------------------------------------------------------------------------
    const summaryRows = [
        ["FFXIV Map Tracker", "Report"],
        ["Generated", new Date().toISOString()],
        [],
        ["Metric", "Value"],
        ["Total maps", totals.totalMaps],
        ["Portal-eligible maps", totals.portalEligibleMaps],
        ["Portals", totals.totalPortals],
        ["Portal rate", totals.portalRate / 100],
        ["Dungeon clears", totals.totalClears],
        ["Clear rate", totals.clearRate / 100],
        ["Gil earned", totals.earnedGil],
        ["Gil spent", totals.spentGil],
        ["Net profit", totals.profitGil],
        ["Average profit / map", totals.avgProfitPerMap]
    ];

    const dashboardSheet = XLSX.utils.aoa_to_sheet(summaryRows);
    dashboardSheet["!cols"] = [
        { wch: 24 },
        { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(workbook, dashboardSheet, "Dashboard");

    // ------------------------------------------------------------------------
    // Sessions
    // ------------------------------------------------------------------------
    const sessionRows = appData.sessions.map(sessionToRow);

    const emptySessionRow = {
        Date: "",
        Map: "",
        Level: "",
        Type: "",
        Maps: 0,
        Portals: 0,
        Clears: 0,
        "Gil Earned": 0,
        "Gil Spent": 0,
        "Net Profit": 0,
        Note: "",
        Source: ""
    };

    const sessionsSheet = XLSX.utils.json_to_sheet(
        sessionRows.length ? sessionRows : [emptySessionRow]
    );

    sessionsSheet["!cols"] = [
        { wch: 15 },
        { wch: 28 },
        { wch: 8 },
        { wch: 10 },
        { wch: 8 },
        { wch: 9 },
        { wch: 8 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 36 },
        { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(workbook, sessionsSheet, "Sessions");

    // ------------------------------------------------------------------------
    // Aggregated map statistics
    // ------------------------------------------------------------------------
    const mapsSheet = XLSX.utils.json_to_sheet(mapRows.map(mapStatsToRow));
    mapsSheet["!cols"] = [
        { wch: 28 },
        { wch: 8 },
        { wch: 10 },
        { wch: 15 },
        { wch: 26 },
        { wch: 8 },
        { wch: 9 },
        { wch: 13 },
        { wch: 8 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 }
    ];
    XLSX.utils.book_append_sheet(workbook, mapsSheet, "Maps");

    // ------------------------------------------------------------------------
    // Aggregated level statistics
    // ------------------------------------------------------------------------
    const levelsSheet = XLSX.utils.json_to_sheet(levelRows.map(levelStatsToRow));
    XLSX.utils.book_append_sheet(workbook, levelsSheet, "Levels");

    // ------------------------------------------------------------------------
    // Map database reference
    // ------------------------------------------------------------------------
    const databaseSheet = XLSX.utils.json_to_sheet(
        MAPS_DATABASE.map(mapDatabaseToRow)
    );
    XLSX.utils.book_append_sheet(workbook, databaseSheet, "Map Database");

    const data = XLSX.write(workbook, {
        type: "array",
        bookType: "ods",
        compression: true
    });

    return new Blob([data], {
        type: "application/vnd.oasis.opendocument.spreadsheet"
    });
}

// ============================================================================
// Browser download
// ============================================================================
export function exportOds(appData) {
    downloadBlob(createOdsBlob(appData), `${datedBaseName()}_report.ods`);
}
