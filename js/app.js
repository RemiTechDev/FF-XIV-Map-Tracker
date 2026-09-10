import { MAPS_DATABASE } from "./mapsData.js";
import { loadState, saveState, clearState, saveSession } from "./storage.js";
import { calculateTotals, calculateAvgGil } from "./calculations.js";

function buildDefaultMapData() {
    const data = {};
    MAPS_DATABASE.forEach(m => {
        data[m.id] = {
            num_maps: 0,
            num_portals: 0,
            num_clears: 0,
            earned_gil: 0,
            isParty: m.type === "Party"
        };
    });
    return data;
}

let mapData = loadState(buildDefaultMapData());
let currentLang = "PL";
let currentFilter = "ALL";
let sortKey = "name";
let sortAsc = true;
let barChart = null;

const elements = {
    language: document.getElementById("language"),
    calendar: document.getElementById("calendar"),
    mapSelect: document.getElementById("map-select"),
    numMaps: document.getElementById("num-maps"),
    numPortals: document.getElementById("num-portals"),
    numClears: document.getElementById("num-clears"),
    earnedGil: document.getElementById("earned-gil"),

    totalMaps: document.getElementById("total-maps"),
    totalPortals: document.getElementById("total-portals"),
    totalClears: document.getElementById("total-clears"),
    totalGil: document.getElementById("total-gil"),

    tableBody: document.getElementById("data-table").querySelector("tbody")
};

const translations = {
    PL: {
        eyebrowHeader: "DZIENNIK POSZUKIWACZA PRZYGÓD",
        title: "FFXIV Map Tracker",
        description: "Śledź mapy, portale, ukończone lochy i zysk w Gil.",
        totalMaps: "Razem mapy",
        totalPortals: "Razem portale",
        totalClears: "Ukończone lochy",
        totalGil: "Suma Gil",
        language: "Wybór języka",
        date: "Wybierz datę",
        mapLabel: "Mapa",
        numMaps: "Liczba map",
        numPortals: "Liczba portali",
        numClears: "Ukończone lochy (Clears)",
        earnedGil: "Zarobiony Gil",
        addDataBtn: "Dodaj dane",
        editDataBtn: "Edytuj dane",
        deleteDataBtn: "Usuń wybrane dane",
        resetAllBtn: "Wyczyść wszystko",
        saveCsvBtn: "Zapisz jako CSV",
        saveExcelBtn: "Zapisz jako Excel",
        eyebrowStats: "STATYSTYKI",
        chartTitle: "Przegląd zysków i wskaźników",
        eyebrowData: "DANE",
        tableTitle: "Szczegóły map i zysku",
        thName: "Nazwa mapy",
        thType: "Typ",
        thLevel: "Poziom",
        thMaps: "Mapy",
        thPortals: "Portale",
        thClears: "Clears",
        thGil: "Suma Gil",
        thAvgGil: "Śr. Gil / Mapa",
        thQuick: "+1 Szybkie akcje"
    },
    ENG: {
        eyebrowHeader: "ADVENTURER'S RECORD",
        title: "FFXIV Map Tracker",
        description: "Track maps, portals, dungeon clears and Gil earnings.",
        totalMaps: "Total maps",
        totalPortals: "Total portals",
        totalClears: "Dungeon Clears",
        totalGil: "Total Gil",
        language: "Language",
        date: "Select date",
        mapLabel: "Map",
        numMaps: "Number of maps",
        numPortals: "Number of portals",
        numClears: "Dungeon Clears",
        earnedGil: "Earned Gil",
        addDataBtn: "Add data",
        editDataBtn: "Edit data",
        deleteDataBtn: "Delete selected data",
        resetAllBtn: "Reset all data",
        saveCsvBtn: "Save as CSV",
        saveExcelBtn: "Save as Excel",
        eyebrowStats: "STATISTICS",
        chartTitle: "Earnings & Rates Overview",
        eyebrowData: "DATA",
        tableTitle: "Map Details & Earnings",
        thName: "Map Name",
        thType: "Type",
        thLevel: "Level",
        thMaps: "Maps",
        thPortals: "Portals",
        thClears: "Clears",
        thGil: "Total Gil",
        thAvgGil: "Avg. Gil / Map",
        thQuick: "+1 Quick Actions"
    },
    FR: {
        eyebrowHeader: "REGISTRE D'AVENTURIER",
        title: "Suivi de carte FFXIV",
        description: "Suivez vos cartes, portails, donjons terminés et vos gains en Gils.",
        totalMaps: "Cartes totales",
        totalPortals: "Portails totaux",
        totalClears: "Donjons terminés",
        totalGil: "Gils totaux",
        language: "Langue",
        date: "Sélectionner une date",
        mapLabel: "Carte",
        numMaps: "Nombre de cartes",
        numPortals: "Nombre de portails",
        numClears: "Donjons terminés",
        earnedGil: "Gils gagnés",
        addDataBtn: "Ajouter des données",
        editDataBtn: "Modifier les données",
        deleteDataBtn: "Supprimer les données",
        resetAllBtn: "Tout réinitialiser",
        saveCsvBtn: "Enregistrer CSV",
        saveExcelBtn: "Enregistrer Excel",
        eyebrowStats: "STATISTIQUES",
        chartTitle: "Aperçu des gains et des taux",
        eyebrowData: "DONNÉES",
        tableTitle: "Détails des cartes et gains",
        thName: "Nom de la carte",
        thType: "Type",
        thLevel: "Niveau",
        thMaps: "Cartes",
        thPortals: "Portails",
        thClears: "Clears",
        thGil: "Gils totaux",
        thAvgGil: "Moy. Gils / Carte",
        thQuick: "+1 Actions rapides"
    }
};

function populateMapDropdown() {
    elements.mapSelect.innerHTML = "";
    MAPS_DATABASE.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `[Lv.${m.level}] ${m.name} (${m.type})`;
        elements.mapSelect.appendChild(opt);
    });
}

function initCharts() {
    const barCanvas = document.getElementById("charts");
    if (barCanvas && typeof Chart !== "undefined") {
        barChart = new Chart(barCanvas.getContext("2d"), {
            type: "bar",
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#dce4ef" } } },
                scales: {
                    x: { ticks: { color: "#9ba7b7" }, grid: { color: "rgba(255,255,255,0.05)" } },
                    y: { beginAtZero: true, ticks: { color: "#9ba7b7" }, grid: { color: "rgba(255,255,255,0.05)" } }
                }
            }
        });
    }
}

function updateCharts() {
    if (!barChart) return;
    const labels = [];
    const gilData = [];

    MAPS_DATABASE.forEach(m => {
        const entry = mapData[m.id];
        if (entry && entry.earned_gil > 0) {
            labels.push(m.name);
            gilData.push(entry.earned_gil);
        }
    });

    barChart.data.labels = labels;
    barChart.data.datasets = [{
        label: "Gil per Map Type",
        data: gilData,
        backgroundColor: "rgba(216, 155, 72, 0.75)",
        borderColor: "rgba(216, 155, 72, 1)",
        borderWidth: 1
    }];
    barChart.update();
}

function updateSummary() {
    const totals = calculateTotals(mapData);

    elements.totalMaps.textContent = `${totals.totalMaps} (Portal: ${totals.portalRate}%)`;
    elements.totalPortals.textContent = totals.totalPortals;
    elements.totalClears.textContent = `${totals.totalClears} (Clear: ${totals.clearRate}%)`;
    elements.totalGil.textContent = `${totals.totalGil.toLocaleString()} Gil`;

    saveState(mapData);
    updateCharts();
    updateTable();
}

function getFilteredAndSortedMaps() {
    let list = [...MAPS_DATABASE];

    if (currentFilter === "PARTY") list = list.filter(m => m.type === "Party");
    if (currentFilter === "SOLO") list = list.filter(m => m.type === "Solo");

    list.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (sortKey === "earned_gil" || sortKey === "num_maps" || sortKey === "num_portals") {
            valA = mapData[a.id][sortKey] || 0;
            valB = mapData[b.id][sortKey] || 0;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });

    return list;
}

function updateTable() {
    elements.tableBody.innerHTML = "";
    const filteredMaps = getFilteredAndSortedMaps();

    filteredMaps.forEach(m => {
        const entry = mapData[m.id] || { num_maps: 0, num_portals: 0, num_clears: 0, earned_gil: 0 };
        const avgGil = calculateAvgGil(entry.earned_gil, entry.num_maps);

        const row = elements.tableBody.insertRow();
        row.innerHTML = `
            <td><strong>${m.name}</strong></td>
            <td>${m.type}</td>
            <td>${m.level}</td>
            <td>${entry.num_maps}</td>
            <td>${m.type === "Party" ? entry.num_portals : "-"}</td>
            <td>${m.type === "Party" ? entry.num_clears : "-"}</td>
            <td>${entry.earned_gil.toLocaleString()} Gil</td>
            <td>${avgGil.toLocaleString()} Gil</td>
            <td>
                <button class="quick-add" data-id="${m.id}" data-type="map">+1 Map</button>
                ${m.type === "Party" ? `<button class="quick-add" data-id="${m.id}" data-type="portal">+1 Portal</button>` : ""}
                ${m.type === "Party" ? `<button class="quick-add" data-id="${m.id}" data-type="clear">+1 Clear</button>` : ""}
            </td>
        `;
    });

    document.querySelectorAll(".quick-add").forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.getAttribute("data-id");
            const type = e.target.getAttribute("data-type");
            if (type === "map") mapData[id].num_maps += 1;
            if (type === "portal") mapData[id].num_portals += 1;
            if (type === "clear") mapData[id].num_clears += 1;
            updateSummary();
        };
    });
}

function changeLanguage(lang) {
    const t = translations[lang];
    if (!t) return;
    currentLang = lang;

    document.getElementById("header-eyebrow").textContent = t.eyebrowHeader;
    document.getElementById("main-title").textContent = t.title;
    document.querySelector(".header-description").textContent = t.description;

    document.getElementById("summary-maps-label").textContent = t.totalMaps;
    document.getElementById("summary-portals-label").textContent = t.totalPortals;
    document.getElementById("summary-clears-label").textContent = t.totalClears;
    document.getElementById("summary-gil-label").textContent = t.totalGil;

    document.querySelector('label[for="language"]').textContent = t.language;
    document.querySelector('label[for="calendar"]').textContent = t.date;
    document.querySelector('label[for="map-select"]').textContent = t.mapLabel;
    document.querySelector('label[for="num-maps"]').textContent = t.numMaps;
    document.querySelector('label[for="num-portals"]').textContent = t.numPortals;
    document.querySelector('label[for="num-clears"]').textContent = t.numClears;
    document.querySelector('label[for="earned-gil"]').textContent = t.earnedGil;

    document.getElementById("add-data").textContent = t.addDataBtn;
    document.getElementById("edit-data").textContent = t.editDataBtn;
    document.getElementById("delete-data").textContent = t.deleteDataBtn;
    document.getElementById("reset-all").textContent = t.resetAllBtn;

    document.getElementById("chart-eyebrow").textContent = t.eyebrowStats;
    document.getElementById("chart-title").textContent = t.chartTitle;
    document.getElementById("table-eyebrow").textContent = t.eyebrowData;
    document.getElementById("table-title").textContent = t.tableTitle;

    document.getElementById("th-name").textContent = t.thName;
    document.getElementById("th-type").textContent = t.thType;
    document.getElementById("th-level").textContent = t.thLevel;
    document.getElementById("th-maps").textContent = t.thMaps;
    document.getElementById("th-portals").textContent = t.thPortals;
    document.getElementById("th-clears").textContent = t.thClears;
    document.getElementById("th-gil").textContent = t.thGil;
    document.getElementById("th-avggil").textContent = t.thAvgGil;
    document.getElementById("th-quick").textContent = t.thQuick;

    updateCharts();
}

function exportCSV() {
    const exportData = MAPS_DATABASE.map(m => ({
        ID: m.id,
        Name: m.name,
        Level: m.level,
        Type: m.type,
        Maps: mapData[m.id].num_maps,
        Portals: mapData[m.id].num_portals,
        Clears: mapData[m.id].num_clears,
        EarnedGil: mapData[m.id].earned_gil
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `FFXIV_Map_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportExcel() {
    const exportData = MAPS_DATABASE.map(m => ({
        "Mapa": m.name,
        "Poziom": m.level,
        "Typ": m.type,
        "Użyte Mapy": mapData[m.id].num_maps,
        "Portale": mapData[m.id].num_portals,
        "Ukończone Lochy": mapData[m.id].num_clears,
        "Zysk (Gil)": mapData[m.id].earned_gil
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Map Tracker");
    XLSX.writeFile(workbook, `FFXIV_Map_Tracker_${new Date().toISOString().split('T')[0]}.xlsx`);
}

document.addEventListener("DOMContentLoaded", () => {
    populateMapDropdown();
    initCharts();
    updateSummary();

    elements.language.onchange = e => changeLanguage(e.target.value);

    // Przełącznik trybu Overlay
    const toggleBtn = document.getElementById("toggle-overlay-btn");
    if (localStorage.getItem("overlay_mode") === "true") {
        document.body.classList.add("overlay-mode");
        if (toggleBtn) toggleBtn.textContent = "🔍 Pełny widok";
    }

    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isOverlay = document.body.classList.toggle("overlay-mode");
            localStorage.setItem("overlay_mode", isOverlay);
            toggleBtn.textContent = isOverlay ? "🔍 Pełny widok" : "📐 Tryb Overlay";
            updateTable();
        };
    }

    document.getElementById("add-data").onclick = () => {
        const id = elements.mapSelect.value;
        mapData[id].num_maps += parseInt(elements.numMaps.value, 10) || 0;
        mapData[id].num_portals += parseInt(elements.numPortals.value, 10) || 0;
        mapData[id].num_clears += parseInt(elements.numClears.value, 10) || 0;
        mapData[id].earned_gil += parseInt(elements.earnedGil.value, 10) || 0;

        if (elements.calendar.value) {
            saveSession(elements.calendar.value, mapData[id]);
        }

        updateSummary();
        elements.numMaps.value = 0;
        elements.numPortals.value = 0;
        elements.numClears.value = 0;
        elements.earnedGil.value = 0;
    };

    document.getElementById("reset-all").onclick = () => {
        if (confirm("Czy na pewno chcesz usunąć wszystkie dane?")) {
            clearState();
            mapData = buildDefaultMapData();
            updateSummary();
        }
    };

    document.getElementById("save-csv").onclick = exportCSV;
    document.getElementById("save-excel").onclick = exportExcel;
});