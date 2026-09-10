export function calculateTotals(mapData) {
    let totalMaps = 0;
    let totalPartyMaps = 0;
    let totalPortals = 0;
    let totalClears = 0;
    let totalGil = 0;

    Object.values(mapData).forEach(entry => {
        const maps = Number(entry.num_maps) || 0;
        const portals = Number(entry.num_portals) || 0;
        const clears = Number(entry.num_clears) || 0;
        const gil = Number(entry.earned_gil) || 0;

        totalMaps += maps;
        totalPortals += portals;
        totalClears += clears;
        totalGil += gil;

        if (entry.isParty) {
            totalPartyMaps += maps;
        }
    });

    const portalRate = totalPartyMaps > 0 ? ((totalPortals / totalPartyMaps) * 100).toFixed(1) : "0.0";
    const clearRate = totalPortals > 0 ? ((totalClears / totalPortals) * 100).toFixed(1) : "0.0";

    return { totalMaps, totalPartyMaps, totalPortals, totalClears, totalGil, portalRate, clearRate };
}

export function calculateAvgGil(earnedGil, numMaps) {
    const maps = Number(numMaps) || 0;
    const gil = Number(earnedGil) || 0;
    if (maps === 0) return 0;
    return Math.round(gil / maps);
}