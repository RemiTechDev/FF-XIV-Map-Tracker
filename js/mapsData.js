// ============================================================================
// Treasure Map reference database
// ============================================================================
// `type` describes Solo/Party usage. `portalEligible` is intentionally
// separate because not every Party map can open a treasure dungeon portal.

export const MAPS_DATABASE = [
    {
        id: "braaxskin",
        name: "Br'aaxskin Map",
        level: 100,
        type: "Party",
        dungeon: "Cenote Ja Ja Gbal",
        portalEligible: true
    },
    {
        id: "loboskin",
        name: "Loboskin Map",
        level: 100,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },

    {
        id: "ophiotauroskin",
        name: "Ophiotauroskin Map",
        level: 90,
        type: "Party",
        dungeon: "The Gymnasion Agonon",
        portalEligible: true
    },
    {
        id: "kumbhiraskin",
        name: "Kumbhiraskin Map",
        level: 90,
        type: "Party",
        dungeon: "The Excitatron 6000",
        portalEligible: true
    },
    {
        id: "saigaskin",
        name: "Saigaskin Map",
        level: 90,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },

    {
        id: "zonureskin",
        name: "Zonureskin Map",
        level: 80,
        type: "Party",
        dungeon: "Dungeons of Lyhe Ghiah",
        portalEligible: true
    },
    {
        id: "gliderskin",
        name: "Gliderskin Map",
        level: 80,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },

    {
        id: "gazelleskin",
        name: "Gazelleskin Map",
        level: 70,
        type: "Party",
        dungeon: "Canals of Uznair",
        portalEligible: true
    },
    {
        id: "thief",
        name: "Thief's Map",
        level: 70,
        type: "Party",
        dungeon: "Deep Canals of Uznair",
        portalEligible: true
    },
    {
        id: "dragonskin70",
        name: "Dragonskin Map (Lv.70)",
        level: 70,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },

    {
        id: "dragonskin60",
        name: "Dragonskin Map (Lv.60)",
        level: 60,
        type: "Party",
        dungeon: "The Aquapolis",
        portalEligible: true
    },
    {
        id: "archaeoskin",
        name: "Archaeoskin Map",
        level: 60,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },
    {
        id: "wyvernskin",
        name: "Wyvernskin Map",
        level: 60,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },

    {
        id: "peisteskin",
        name: "Peisteskin Map",
        level: 50,
        type: "Party",
        dungeon: null,
        portalEligible: false
    },
    {
        id: "boarskin",
        name: "Boarskin Map",
        level: 50,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },
    {
        id: "toadskin",
        name: "Toadskin Map",
        level: 50,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },
    {
        id: "goatskin",
        name: "Goatskin Map",
        level: 45,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    },
    {
        id: "leather",
        name: "Leather Map",
        level: 40,
        type: "Solo",
        dungeon: null,
        portalEligible: false
    }
];


// ============================================================================
// Lookup helpers
// ============================================================================
export function getMapById(mapId) {
    return MAPS_DATABASE.find(map => map.id === mapId) ?? null;
}

export function getMapLevels() {
    return [...new Set(MAPS_DATABASE.map(map => map.level))].sort((a, b) => b - a);
}
