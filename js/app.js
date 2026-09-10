import { MAPS_DATABASE } from './mapsData.js';
import { loadState, saveState } from './storage.js';
import { calculateTotals, calculateAvgGil } from './calculations.js';

let appState = {};
let chartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // Ładowanie domyślnego stanu
    const defaultData = {};
    MAPS_DATABASE.forEach(map => {
        defaultData[map.id] = {
            mapId: map.id,
            num_maps: 0,
            num_portals: 0,
            num_clears: 0,
            earned_gil: 0,
            isParty: map.type === "Party"
        };
    });

    appState = loadState(defaultData);

    // Wypełnienie wyboru daty i listy map
    const calendar = document.getElementById("calendar");
    if (calendar && !calendar.value) {
        calendar.value = new Date().toISOString().split('T')[0];
    }

    populateMapSelect();
    setupEventListeners();
    updateUI();
}

function populateMapSelect() {
    const select = document.getElementById("map-select");
    if (!select) return;

    select.innerHTML = MAPS_DATABASE.map(map =>
        `<option value="${map.id}">[Lv.${map.level}] ${map.name} (${map.type})</option>`
    ).join("");
}

function setupEventListeners() {
    const addBtn = document.getElementById("add-data");
    if (addBtn) {
        addBtn.addEventListener("click", handleAddData);
    }
}

function handleAddData() {
    const mapId = document.getElementById("map-select").value;
    const numMaps = Number(document.getElementById("num-maps").value) || 0;
    const numPortals = Number(document.getElementById("num-portals").value) || 0;
    const numClears = Number(document.getElementById("num-clears").value) || 0;
    const earnedGil = Number(document.getElementById("earned-gil").value) || 0;

    if (!appState[mapId]) {
        const mapInfo = MAPS_DATABASE.find(m => m.id === mapId);
        appState[mapId] = { mapId, num_maps: 0, num_portals: 0, num_clears: 0, earned_gil: 0, isParty: mapInfo?.type === "Party" };
    }

    appState[mapId].num_maps += numMaps;
    appState[mapId].num_portals += numPortals;
    appState[mapId].num_clears += numClears;
    appState[mapId].earned_gil += earnedGil;

    saveState(appState);
    updateUI();

    // Reset pól formularza
    document.getElementById("num-maps").value = 0;
    document.getElementById("num-portals").value = 0;
    document.getElementById("num-clears").value = 0;
    document.getElementById("earned-gil").value = 0;
}

function updateUI() {
    const totals = calculateTotals(appState);

    // Aktualizacja kart podsumowania
    document.getElementById("total-maps").textContent = totals.totalMaps;
    document.getElementById("total-portals").textContent = totals.totalPortals;
    document.getElementById("total-clears").textContent = totals.totalClears;
    document.getElementById("total-gil").textContent = `${totals.totalGil.toLocaleString()} Gil`;

    renderTable();
    renderChart();
}

function renderTable() {
    const tbody = document.querySelector("#data-table tbody");
    if (!tbody) return;

    tbody.innerHTML = MAPS_DATABASE.map(map => {
        const entry = appState[map.id] || { num_maps: 0, num_portals: 0, num_clears: 0, earned_gil: 0 };
        const avgGil = calculateAvgGil(entry.earned_gil, entry.num_maps);

        return `
            <tr>
                <td><strong>${map.name}</strong></td>
                <td>Lv. ${map.level}</td>
                <td>${map.type}</td>
                <td>${entry.num_maps}</td>
                <td>${entry.num_portals}</td>
                <td>${entry.num_clears}</td>
                <td>${Number(entry.earned_gil).toLocaleString()} Gil</td>
                <td>${avgGil.toLocaleString()} Gil</td>
            </tr>
        `;
    }).join("");
}

function renderChart() {
    const ctx = document.getElementById("charts")?.getContext("2d");
    if (!ctx) return;

    const labels = MAPS_DATABASE.map(m => `[Lv.${m.level}] ${m.name}`);
    const mapsData = MAPS_DATABASE.map(m => appState[m.id]?.num_maps || 0);
    const portalsData = MAPS_DATABASE.map(m => appState[m.id]?.num_portals || 0);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Mapy', data: mapsData, backgroundColor: '#c5a059' },
                { label: 'Portale', data: portalsData, backgroundColor: '#4a70a9' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#8c92a0', font: { size: 10 } }, grid: { color: '#232730' } },
                y: { ticks: { color: '#8c92a0' }, grid: { color: '#232730' }, beginAtZero: true }
            },
            plugins: {
                legend: { labels: { color: '#ffffff' } }
            }
        }
    });
}