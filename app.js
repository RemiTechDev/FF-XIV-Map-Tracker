const mapData = {
    70: { num_maps: 0, num_portals: 0 },
    80: { num_maps: 0, num_portals: 0 },
    90: { num_maps: 0, num_portals: 0 },
    100: { num_maps: 0, num_portals: 0 }
};

const elements = {
    totalMaps: document.getElementById("total-maps"),
    totalPortals: document.getElementById("total-portals"),
    mapsWithoutPortals: document.getElementById("maps-without-portals"),
    percentageWithoutPortals: document.getElementById("percentage-without-portals"),

    language: document.getElementById("language"),
    calendar: document.getElementById("calendar"),
    mapLevel: document.getElementById("map-level"),
    numMaps: document.getElementById("num-maps"),
    numPortals: document.getElementById("num-portals"),

    tableBody: document.getElementById("data-table").querySelector("tbody")
};

const translations = {
    PL: {
        eyebrowHeader: "DZIENNIK POSZUKIWACZA PRZYGÓD",
        title: "FFXIV Map Tracker",
        description: "Śledź mapy, portale i postęp swoich treasure runs.",

        totalMaps: "Razem mapy",
        totalPortals: "Razem portale",
        mapsWithoutPortals: "Mapy bez portali",
        percentageWithoutPortals: "Bez portali",

        language: "Wybór języka",
        date: "Wybierz datę",
        mapLevel: "Poziom mapy",
        numMaps: "Liczba map",
        numPortals: "Liczba portali",

        addDataBtn: "Dodaj dane",
        editDataBtn: "Edytuj dane",
        deleteDataBtn: "Usuń wybrane dane",

        loadCsvBtn: "Załaduj CSV",
        saveCsvBtn: "Zapisz jako CSV",

        loadExcelBtn: "Załaduj Excel",
        saveExcelBtn: "Zapisz jako Excel",

        eyebrowStats: "STATYSTYKI",
        chartTitle: "Przegląd map",
        chartLabels: ["Mapy", "Portale", "Bez portali"],
        levelPrefix: "Poziom",

        eyebrowData: "DANE",
        tableTitle: "Poziomy map",
        tableHeaderLevel: "Poziom mapy",
        tableHeaderMaps: "Liczba map",
        tableHeaderPortals: "Liczba portali",
        tableHeaderPercentage: "Procent bez portali"
    },

    ENG: {
        eyebrowHeader: "ADVENTURER'S RECORD",
        title: "FFXIV Map Tracker",
        description: "Track maps, portals and your treasure run progress.",

        totalMaps: "Total maps",
        totalPortals: "Total portals",
        mapsWithoutPortals: "Maps without portals",
        percentageWithoutPortals: "Without portals",

        language: "Language",
        date: "Select date",
        mapLevel: "Map level",
        numMaps: "Number of maps",
        numPortals: "Number of portals",

        addDataBtn: "Add data",
        editDataBtn: "Edit data",
        deleteDataBtn: "Delete selected data",

        loadCsvBtn: "Load CSV",
        saveCsvBtn: "Save as CSV",

        loadExcelBtn: "Load Excel",
        saveExcelBtn: "Save as Excel",

        eyebrowStats: "STATISTICS",
        chartTitle: "Map overview",
        chartLabels: ["Maps", "Portals", "Without Portals"],
        levelPrefix: "Level",

        eyebrowData: "DATA",
        tableTitle: "Map Levels",
        tableHeaderLevel: "Map level",
        tableHeaderMaps: "Number of maps",
        tableHeaderPortals: "Number of portals",
        tableHeaderPercentage: "Percentage without portals"
    },

    FR: {
        eyebrowHeader: "REGISTRE D'AVENTURIER",
        title: "Suivi de carte FFXIV",
        description: "Suivez vos cartes, portails et votre progression.",

        totalMaps: "Cartes totales",
        totalPortals: "Portails totaux",
        mapsWithoutPortals: "Cartes sans portails",
        percentageWithoutPortals: "Sans portails",

        language: "Langue",
        date: "Sélectionner une date",
        mapLevel: "Niveau de carte",
        numMaps: "Nombre de cartes",
        numPortals: "Nombre de portails",

        addDataBtn: "Ajouter des données",
        editDataBtn: "Modifier les données",
        deleteDataBtn: "Supprimer les données",

        loadCsvBtn: "Charger CSV",
        saveCsvBtn: "Enregistrer CSV",

        loadExcelBtn: "Charger Excel",
        saveExcelBtn: "Enregistrer Excel",

        eyebrowStats: "STATISTIQUES",
        chartTitle: "Aperçu des cartes",
        chartLabels: ["Cartes", "Portails", "Sans Portails"],
        levelPrefix: "Niveau",

        eyebrowData: "DONNÉES",
        tableTitle: "Niveaux de cartes",
        tableHeaderLevel: "Niveau",
        tableHeaderMaps: "Cartes",
        tableHeaderPortals: "Portails",
        tableHeaderPercentage: "Pourcentage sans portails"
    }
};

let currentLang = "PL";
let chart = null;

/* --------------------------------
   CHART SETUP & UPDATE
-------------------------------- */
function createChart() {
    const canvas = document.getElementById("charts");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: translations[currentLang].chartLabels,
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#dce4ef" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#9ba7b7" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#9ba7b7" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            }
        }
    });
}

function updateChart() {
    if (!chart) return;

    const colors = {
        70: "rgba(77, 155, 216, 0.75)",
        80: "rgba(130, 105, 220, 0.75)",
        90: "rgba(216, 155, 72, 0.75)",
        100: "rgba(210, 82, 105, 0.75)"
    };

    const t = translations[currentLang];
    chart.data.labels = t.chartLabels;
    chart.data.datasets = [];

    Object.keys(mapData).forEach(level => {
        const maps = Number(mapData[level].num_maps) || 0;
        const portals = Number(mapData[level].num_portals) || 0;

        chart.data.datasets.push({
            label: `${t.levelPrefix} ${level}`,
            data: [
                maps,
                portals,
                Math.max(0, maps - portals)
            ],
            backgroundColor: colors[level],
            borderColor: colors[level].replace("0.75", "1"),
            borderWidth: 1
        });
    });

    chart.update();
}

/* --------------------------------
   SUMMARY & TABLE
-------------------------------- */
function updateSummary() {
    let totalMaps = 0;
    let totalPortals = 0;

    Object.values(mapData).forEach(level => {
        totalMaps += Number(level.num_maps) || 0;
        totalPortals += Number(level.num_portals) || 0;
    });

    const mapsWithoutPortals = Math.max(0, totalMaps - totalPortals);
    const percentage = totalMaps > 0 ? ((mapsWithoutPortals / totalMaps) * 100).toFixed(2) : "0.00";

    elements.totalMaps.textContent = totalMaps;
    elements.totalPortals.textContent = totalPortals;
    elements.mapsWithoutPortals.textContent = mapsWithoutPortals;
    elements.percentageWithoutPortals.textContent = `${percentage}%`;

    updateChart();
    updateTable();
}

function updateTable() {
    elements.tableBody.innerHTML = "";

    Object.keys(mapData).forEach(level => {
        const maps = Number(mapData[level].num_maps) || 0;
        const portals = Number(mapData[level].num_portals) || 0;
        const withoutPortals = Math.max(0, maps - portals);
        const percentage = maps > 0 ? ((withoutPortals / maps) * 100).toFixed(2) : "0.00";

        const row = elements.tableBody.insertRow();
        row.innerHTML = `
            <td>${level}</td>
            <td>${maps}</td>
            <td>${portals}</td>
            <td>${percentage}%</td>
        `;
    });
}

/* --------------------------------
   LANGUAGE SWITCHER
-------------------------------- */
function changeLanguage(lang) {
    const t = translations[lang];
    if (!t) return;

    currentLang = lang;
    document.documentElement.lang = lang === "PL" ? "pl" : lang === "FR" ? "fr" : "en";
    document.title = t.title;

    // Header principal
    const eyebrowHeader = document.querySelector(".page-header .eyebrow");
    if (eyebrowHeader) eyebrowHeader.textContent = t.eyebrowHeader;

    document.getElementById("main-title").textContent = t.title;
    document.querySelector(".header-description").textContent = t.description;

    // Podsumowanie
    document.getElementById("summary-maps-label").textContent = t.totalMaps;
    document.getElementById("summary-portals-label").textContent = t.totalPortals;
    document.getElementById("summary-without-portals-label").textContent = t.mapsWithoutPortals;
    document.getElementById("summary-percentage-label").textContent = t.percentageWithoutPortals;

    // Menu boczne
    elements.language.closest(".menu").querySelector('label[for="language"]').textContent = t.language;
    elements.calendar.closest(".menu").querySelector('label[for="calendar"]').textContent = t.date;
    elements.mapLevel.closest(".menu").querySelector('label[for="map-level"]').textContent = t.mapLevel;
    elements.numMaps.closest(".menu").querySelector('label[for="num-maps"]').textContent = t.numMaps;
    elements.numPortals.closest(".menu").querySelector('label[for="num-portals"]').textContent = t.numPortals;

    // Przyciski
    document.getElementById("add-data").textContent = t.addDataBtn;
    document.getElementById("edit-data").textContent = t.editDataBtn;
    document.getElementById("delete-data").textContent = t.deleteDataBtn;
    document.getElementById("load-csv").textContent = t.loadCsvBtn;
    document.getElementById("save-csv").textContent = t.saveCsvBtn;
    document.getElementById("load-excel").textContent = t.loadExcelBtn;
    document.getElementById("save-excel").textContent = t.saveExcelBtn;

    // Sekcja Wykresu
    const chartPanel = document.querySelector(".chart-panel");
    if (chartPanel) {
        chartPanel.querySelector(".eyebrow").textContent = t.eyebrowStats;
        chartPanel.querySelector("h2").textContent = t.chartTitle;
    }

    // Sekcja Tabeli
    const tablePanel = document.querySelector("#data-table").closest(".panel");
    if (tablePanel) {
        tablePanel.querySelector(".eyebrow").textContent = t.eyebrowData;
        tablePanel.querySelector("h2").textContent = t.tableTitle;
    }

    document.getElementById("table-header-level").textContent = t.tableHeaderLevel;
    document.getElementById("table-header-maps").textContent = t.tableHeaderMaps;
    document.getElementById("table-header-portals").textContent = t.tableHeaderPortals;
    document.getElementById("table-header-percentage").textContent = t.tableHeaderPercentage;

    // Odświeżenie wykresu z nowymi etykietami
    updateChart();
}

/* --------------------------------
   ACTIONS (ADD / EDIT / DELETE)
-------------------------------- */
document.getElementById("add-data").onclick = () => {
    const level = elements.mapLevel.value;
    const maps = parseInt(elements.numMaps.value, 10);
    const portals = parseInt(elements.numPortals.value, 10);

    if (Number.isNaN(maps) || Number.isNaN(portals) || maps < 0 || portals < 0) {
        alert(currentLang === "PL" ? "Podaj poprawne liczby." : currentLang === "FR" ? "Veuillez entrer des nombres valides." : "Please enter valid numbers.");
        return;
    }

    if (portals > maps) {
        alert(currentLang === "PL" ? "Liczba portali nie może być większa niż liczba map." : currentLang === "FR" ? "Le nombre de portails ne peut pas être supérieur au nombre de cartes." : "Number of portals cannot exceed number of maps.");
        return;
    }

    mapData[level].num_maps += maps;
    mapData[level].num_portals += portals;

    updateSummary();

    elements.numMaps.value = 0;
    elements.numPortals.value = 0;
};

document.getElementById("edit-data").onclick = () => {
    const level = elements.mapLevel.value;

    const newMaps = prompt("Liczba map / Number of maps / Nombre de cartes:", mapData[level].num_maps);
    if (newMaps === null) return;

    const newPortals = prompt("Liczba portali / Number of portals / Nombre de portails:", mapData[level].num_portals);
    if (newPortals === null) return;

    const maps = parseInt(newMaps, 10);
    const portals = parseInt(newPortals, 10);

    if (Number.isNaN(maps) || Number.isNaN(portals) || maps < 0 || portals < 0 || portals > maps) {
        alert(currentLang === "PL" ? "Podaj poprawne wartości." : "Invalid values.");
        return;
    }

    mapData[level].num_maps = maps;
    mapData[level].num_portals = portals;

    updateSummary();
};

document.getElementById("delete-data").onclick = () => {
    const level = elements.mapLevel.value;
    const confirmed = confirm(`Czy na pewno usunąć dane dla poziomu ${level}?`);
    if (!confirmed) return;

    mapData[level].num_maps = 0;
    mapData[level].num_portals = 0;

    updateSummary();
};

/* --------------------------------
   CSV IMPORT / EXPORT
-------------------------------- */
document.getElementById("load-csv").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.onchange = event => {
        const file = event.target.files[0];
        if (!file || typeof Papa === "undefined") return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: result => {
                result.data.forEach(entry => {
                    const level = parseInt(entry.level, 10);
                    const maps = parseInt(entry.num_maps, 10);
                    const portals = parseInt(entry.num_portals, 10);

                    if (mapData[level] && !Number.isNaN(maps) && !Number.isNaN(portals)) {
                        mapData[level].num_maps = Math.max(0, maps);
                        mapData[level].num_portals = Math.max(0, Math.min(portals, maps));
                    }
                });
                updateSummary();
            }
        });
    };
    input.click();
};

document.getElementById("save-csv").onclick = () => {
    const rows = [["level", "num_maps", "num_portals"]];
    Object.keys(mapData).forEach(level => {
        rows.push([level, mapData[level].num_maps, mapData[level].num_portals]);
    });

    const csv = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "map_data.csv";
    link.click();
    URL.revokeObjectURL(url);
};

/* --------------------------------
   EXCEL IMPORT / EXPORT
-------------------------------- */
document.getElementById("load-excel").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx";

    input.onchange = event => {
        const file = event.target.files[0];
        if (!file || typeof XLSX === "undefined") return;

        const reader = new FileReader();
        reader.onload = e => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            Object.keys(mapData).forEach(level => {
                mapData[level].num_maps = 0;
                mapData[level].num_portals = 0;
            });

            rows.forEach(row => {
                const level = parseInt(row[0], 10);
                const maps = parseInt(row[1], 10);
                const portals = parseInt(row[2], 10);

                if (mapData[level] && !Number.isNaN(maps) && !Number.isNaN(portals)) {
                    mapData[level].num_maps = Math.max(0, maps);
                    mapData[level].num_portals = Math.max(0, Math.min(portals, maps));
                }
            });

            updateSummary();
        };
        reader.readAsArrayBuffer(file);
    };
    input.click();
};

document.getElementById("save-excel").onclick = () => {
    if (typeof XLSX === "undefined") {
        alert("Biblioteka Excel nie została załadowana.");
        return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
        Object.keys(mapData).map(level => ({
            level,
            num_maps: mapData[level].num_maps,
            num_portals: mapData[level].num_portals
        }))
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, "Map Data");
    XLSX.writeFile(workbook, "map_data.xlsx");
};

/* --------------------------------
   INIT & EVENT LISTENERS
-------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    createChart();
    updateSummary();

    elements.language.onchange = e => {
        changeLanguage(e.target.value);
    };
});