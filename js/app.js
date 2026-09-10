let currentLang = 'pl';
let mapsChartInstance = null;
let gilChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupLanguageSelector();
    setupOverlayToggle();
    if (typeof renderMapOptions === "function") renderMapOptions();
    updateUI();

    const form = document.getElementById("entryForm");
    if (form) form.addEventListener("submit", handleFormSubmit);
}

function setupLanguageSelector() {
    const langSelect = document.getElementById("languageSelect");
    if (!langSelect) return;
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
    if (btn) {
        btn.addEventListener("click", () => {
            document.body.classList.toggle("overlay-mode");
        });
    }
}

function updateUI() {
    const data = typeof Storage !== "undefined" ? Storage.loadData() : [];
    const stats = typeof Calculations !== "undefined" ? Calculations.computeStats(data) : null;

    if (stats) {
        updateStatCards(stats);
        updateTable(stats);
        updateCharts(stats);
    }
}

function updateStatCards(stats) {
    const portalRate = stats.totalMaps > 0 ? ((stats.totalPortals / stats.totalMaps) * 100).toFixed(1) : 0;
    const clearRate = stats.totalPortals > 0 ? ((stats.totalClears / stats.totalPortals) * 100).toFixed(1) : 0;

    document.getElementById("statTotalMaps").textContent = `${stats.totalMaps} (Portal: ${portalRate}%)`;
    document.getElementById("statTotalPortals").textContent = `${stats.totalPortals}`;
    document.getElementById("statCompletedDungeons").textContent = `${stats.totalClears} (Clear: ${clearRate}%)`;
    document.getElementById("statTotalGil").textContent = `${stats.totalGil.toLocaleString()} Gil`;
}

function updateCharts(stats) {
    const langData = translations[currentLang] || translations['pl'];
    const activeStats = stats.mapDetails.filter(m => m.maps > 0);

    const labels = activeStats.map(m => m.name);
    const mapsData = activeStats.map(m => m.maps);
    const portalsData = activeStats.map(m => m.portals);
    const gilData = activeStats.map(m => m.gil);

    // Wykres 1: Aktywność Map i Portali
    const ctxMaps = document.getElementById('mapsChart')?.getContext('2d');
    if (ctxMaps) {
        if (mapsChartInstance) mapsChartInstance.destroy();
        mapsChartInstance = new Chart(ctxMaps, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: langData.thMaps || 'Mapy', data: mapsData, backgroundColor: '#d4af37' },
                    { label: langData.thPortals || 'Portale', data: portalsData, backgroundColor: '#4a90e2' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: langData.chartMapsTitle || 'Ilość map i portali', color: '#f0f0f0' },
                    legend: { labels: { color: '#ccc' } }
                },
                scales: {
                    x: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
                    y: { ticks: { color: '#aaa' }, grid: { color: '#333' }, beginAtZero: true }
                }
            }
        });
    }

    // Wykres 2: Zysk Gil
    const ctxGil = document.getElementById('gilChart')?.getContext('2d');
    if (ctxGil) {
        if (gilChartInstance) gilChartInstance.destroy();
        gilChartInstance = new Chart(ctxGil, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Gil', data: gilData, backgroundColor: '#50e3c2' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: langData.chartGilTitle || 'Zysk Gil', color: '#f0f0f0' },
                    legend: { labels: { color: '#ccc' } }
                },
                scales: {
                    x: { ticks: { color: '#aaa' }, grid: { color: '#333' } },
                    y: { ticks: { color: '#aaa' }, grid: { color: '#333' }, beginAtZero: true }
                }
            }
        });
    }
}