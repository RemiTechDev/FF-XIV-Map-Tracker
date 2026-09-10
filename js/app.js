let currentLang = 'pl';
let mapsChartInstance = null;
let gilChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupLanguageSelector();
    setupOverlayToggle();
    renderMapOptions();
    updateUI();

    document.getElementById("entryForm").addEventListener("submit", handleFormSubmit);
}

function setupLanguageSelector() {
    const langSelect = document.getElementById("languageSelect");
    langSelect.value = currentLang;
    langSelect.addEventListener("change", (e) => {
        currentLang = e.target.value;
        applyTranslations();
        updateUI();
    });
    applyTranslations();
}

function applyTranslations() {
    const langData = translations[currentLang] || translations['pl'];
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (langData[key]) {
            el.textContent = langData[key];
        }
    });
}

function setupOverlayToggle() {
    const btn = document.getElementById("toggleOverlayBtn");
    btn.addEventListener("click", () => {
        document.body.classList.toggle("overlay-mode");
    });
}

function updateUI() {
    const data = Storage.loadData();
    const stats = Calculations.computeStats(data);

    updateStatCards(stats);
    updateTable(stats);
    updateCharts(stats);
}

function updateStatCards(stats) {
    const langData = translations[currentLang];

    const portalRate = stats.totalMaps > 0 ? ((stats.totalPortals / stats.totalMaps) * 100).toFixed(1) : 0;
    const clearRate = stats.totalPortals > 0 ? ((stats.totalClears / stats.totalPortals) * 100).toFixed(1) : 0;

    document.getElementById("statTotalMaps").textContent = `${stats.totalMaps} (Portal: ${portalRate}%)`;
    document.getElementById("statTotalPortals").textContent = `${stats.totalPortals}`;
    document.getElementById("statCompletedDungeons").textContent = `${stats.totalClears} (Clear: ${clearRate}%)`;
    document.getElementById("statTotalGil").textContent = `${stats.totalGil.toLocaleString()} Gil`;
}

function updateCharts(stats) {
    const langData = translations[currentLang];
    const activeStats = stats.mapDetails.filter(m => m.maps > 0);

    const labels = activeStats.map(m => m.name);
    const mapsData = activeStats.map(m => m.maps);
    const portalsData = activeStats.map(m => m.portals);
    const clearsData = activeStats.map(m => m.clears);
    const gilData = activeStats.map(m => m.gil);

    // Wykres 1: Mapy, Portale i Clears
    const ctxMaps = document.getElementById('mapsChart').getContext('2d');
    if (mapsChartInstance) mapsChartInstance.destroy();

    mapsChartInstance = new Chart(ctxMaps, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: langData.thMaps, data: mapsData, backgroundColor: '#36a2eb' },
                { label: langData.thPortals, data: portalsData, backgroundColor: '#ffce56' },
                { label: langData.thClears, data: clearsData, backgroundColor: '#4bc0c0' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: langData.chartMapsTitle, color: '#fff' },
                legend: { labels: { color: '#fff' } }
            },
            scales: {
                x: { ticks: { color: '#ccc' } },
                y: { ticks: { color: '#ccc' }, beginAtZero: true }
            }
        }
    });

    // Wykres 2: Zarobek Gil
    const ctxGil = document.getElementById('gilChart').getContext('2d');
    if (gilChartInstance) gilChartInstance.destroy();

    gilChartInstance = new Chart(ctxGil, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Gil', data: gilData, backgroundColor: '#d4af37' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: langData.chartGilTitle, color: '#fff' },
                legend: { labels: { color: '#fff' } }
            },
            scales: {
                x: { ticks: { color: '#ccc' } },
                y: { ticks: { color: '#ccc' }, beginAtZero: true }
            }
        }
    });
}