// ============================================================================
// Dependencies and numeric helper
// ============================================================================
import { MAPS_DATABASE, getMapById } from "./mapsData.js";

const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;

// ============================================================================
// Session-level calculations
// ============================================================================
export function sessionProfit(session) {
    return number(session.earnedGil) - number(session.spentGil);
}

// ============================================================================
// Global totals / KPIs
// ============================================================================
export function calculateTotals(sessions = []) {
    const totals = {
        totalMaps: 0,
        portalEligibleMaps: 0,
        totalPortals: 0,
        totalClears: 0,
        earnedGil: 0,
        spentGil: 0,
        profitGil: 0,
        portalRate: 0,
        clearRate: 0,
        avgProfitPerMap: 0
    };

    for (const session of sessions) {
        const map = getMapById(session.mapId);
        const maps = Math.max(0, number(session.maps));
        const portals = Math.max(0, number(session.portals));
        const clears = Math.max(0, number(session.clears));
        const earned = Math.max(0, number(session.earnedGil));
        const spent = Math.max(0, number(session.spentGil));

        totals.totalMaps += maps;
        totals.totalPortals += portals;
        totals.totalClears += clears;
        totals.earnedGil += earned;
        totals.spentGil += spent;
        if (map?.portalEligible) totals.portalEligibleMaps += maps;
    }

    totals.profitGil = totals.earnedGil - totals.spentGil;
    totals.portalRate = totals.portalEligibleMaps > 0 ? (totals.totalPortals / totals.portalEligibleMaps) * 100 : 0;
    totals.clearRate = totals.totalPortals > 0 ? (totals.totalClears / totals.totalPortals) * 100 : 0;
    totals.avgProfitPerMap = totals.totalMaps > 0 ? totals.profitGil / totals.totalMaps : 0;
    return totals;
}

// ============================================================================
// Aggregation by map
// ============================================================================
export function aggregateByMap(sessions = []) {
    const result = new Map();

    for (const map of MAPS_DATABASE) {
        result.set(map.id, {
            mapId: map.id,
            name: map.name,
            level: map.level,
            type: map.type,
            dungeon: map.dungeon,
            portalEligible: map.portalEligible,
            maps: 0,
            portals: 0,
            clears: 0,
            earnedGil: 0,
            spentGil: 0,
            profitGil: 0,
            portalRate: 0,
            clearRate: 0,
            avgProfitPerMap: 0
        });
    }

    for (const session of sessions) {
        const row = result.get(session.mapId);
        if (!row) continue;
        row.maps += Math.max(0, number(session.maps));
        row.portals += Math.max(0, number(session.portals));
        row.clears += Math.max(0, number(session.clears));
        row.earnedGil += Math.max(0, number(session.earnedGil));
        row.spentGil += Math.max(0, number(session.spentGil));
    }

    return [...result.values()].map(row => {
        row.profitGil = row.earnedGil - row.spentGil;
        row.portalRate = row.portalEligible && row.maps > 0 ? (row.portals / row.maps) * 100 : 0;
        row.clearRate = row.portals > 0 ? (row.clears / row.portals) * 100 : 0;
        row.avgProfitPerMap = row.maps > 0 ? row.profitGil / row.maps : 0;
        return row;
    });
}

// ============================================================================
// Aggregation by level
// ============================================================================
export function aggregateByLevel(sessions = []) {
    const mapRows = aggregateByMap(sessions);
    const levels = new Map();

    for (const row of mapRows) {
        if (!levels.has(row.level)) {
            levels.set(row.level, {
                level: row.level,
                maps: 0,
                portalEligibleMaps: 0,
                portals: 0,
                clears: 0,
                earnedGil: 0,
                spentGil: 0,
                profitGil: 0,
                portalRate: 0,
                clearRate: 0
            });
        }
        const level = levels.get(row.level);
        level.maps += row.maps;
        level.portals += row.portals;
        level.clears += row.clears;
        level.earnedGil += row.earnedGil;
        level.spentGil += row.spentGil;
        if (row.portalEligible) level.portalEligibleMaps += row.maps;
    }

    return [...levels.values()]
        .map(row => {
            row.profitGil = row.earnedGil - row.spentGil;
            row.portalRate = row.portalEligibleMaps > 0 ? (row.portals / row.portalEligibleMaps) * 100 : 0;
            row.clearRate = row.portals > 0 ? (row.clears / row.portals) * 100 : 0;
            return row;
        })
        .sort((a, b) => b.level - a.level);
}

// ============================================================================
// Aggregation by date
// ============================================================================
export function aggregateByDate(sessions = []) {
    const dates = new Map();
    for (const session of sessions) {
        if (!session.date) continue;
        const date = session.date;
        if (!dates.has(date)) {
            dates.set(date, { date, maps: 0, portals: 0, clears: 0, earnedGil: 0, spentGil: 0, profitGil: 0 });
        }
        const row = dates.get(date);
        row.maps += number(session.maps);
        row.portals += number(session.portals);
        row.clears += number(session.clears);
        row.earnedGil += number(session.earnedGil);
        row.spentGil += number(session.spentGil);
    }
    return [...dates.values()]
        .map(row => ({ ...row, profitGil: row.earnedGil - row.spentGil }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// Filtering
// ============================================================================
export function filterSessions(sessions = [], { period = "ALL", level = "ALL" } =
{}) {
    const now = new Date();
    let threshold = null;
    if (period !== "ALL" && Number(period) > 0) {
        threshold = new Date(now);
        threshold.setHours(0, 0, 0, 0);
        threshold.setDate(threshold.getDate() - Number(period) + 1);
    }

    return sessions.filter(session => {
        const map = getMapById(session.mapId);
        if (!map) return false;
        if (level !== "ALL" && String(map.level) !== String(level)) return false;
        if (!threshold) return true;
        if (!session.date) return false;
        const sessionDate = new Date(`${session.date}T00:00:00`);
        return !Number.isNaN(sessionDate.valueOf()) && sessionDate >= threshold;
    });
}

// ============================================================================
// Display formatting
// ============================================================================
export function formatNumber(value, locale = "pl-PL", maximumFractionDigits = 0) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(number(value));
}

export function formatPercent(value, locale = "pl-PL") {
    return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 1, 
        maximumFractionDigits: 1 }).format(number(value))}%`;
}
