const Calculations = {
    computeStats(data) {
        if (typeof MAPS_DATA === "undefined") return { totalMaps: 0, totalPortals: 0, totalClears: 0, totalGil: 0, mapDetails: [] };

        const mapDetails = MAPS_DATA.map(m => {
            const entries = data.filter(d => d.mapId === m.id);
            const maps = entries.reduce((acc, curr) => acc + Number(curr.mapsCount || 0), 0);
            const portals = entries.reduce((acc, curr) => acc + Number(curr.portalsCount || 0), 0);
            const clears = entries.reduce((acc, curr) => acc + Number(curr.clearsCount || 0), 0);
            const gil = entries.reduce((acc, curr) => acc + Number(curr.gilEarned || 0), 0);

            return {
                ...m,
                maps,
                portals,
                clears,
                gil
            };
        });

        const totalMaps = mapDetails.reduce((acc, m) => acc + m.maps, 0);
        const totalPortals = mapDetails.reduce((acc, m) => acc + m.portals, 0);
        const totalClears = mapDetails.reduce((acc, m) => acc + m.clears, 0);
        const totalGil = mapDetails.reduce((acc, m) => acc + m.gil, 0);

        return {
            totalMaps,
            totalPortals,
            totalClears,
            totalGil,
            mapDetails
        };
    }
};