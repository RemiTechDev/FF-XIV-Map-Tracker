let currentLang = 'en';
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
    const langData = (typeof translations !== "undefined" && translations[currentLang]) ? translations[currentLang] : {};
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
        if (typeof updateTable === "function") updateTable(stats);
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
    const activeStats = stats.mapDetails ? stats.mapDetails.filter(m => m.maps > 0) : [];

    // Etykiety zawierające poziom (Level) oraz nazwę mapy
    const labels = activeStats.map(m => `[Lv.${m.level || '?'}] ${m.name}`);
    const mapsData = activeStats.map(m => m.maps);
    const portalsData = activeStats.map(m => m.portals);
    const clearsData = activeStats.map(m => m.clears);
    const gilData = activeStats.map(m => m.gil);

    // Wykres 1: Statystyki Map, Portali i Clears per Poziom / Mapa
    const ctxMaps = document.getElementById('mapsChart')?.getContext('2d');
    if (ctxMaps) {
        if (mapsChartInstance) mapsChartInstance.destroy();
        mapsChartInstance = new Chart(ctxMaps, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [
                    { label: 'Maps', data: mapsData.length ? mapsData : [0], backgroundColor: '#d4af37' },
                    { label: 'Portals', data: portalsData.length ? portalsData : [0], backgroundColor: '#4a90e2' },
                    { label: 'Clears', data: clearsData.length ? clearsData : [0], backgroundColor: '#2ecc71' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Activity Breakdown by Map Level', color: '#f0f0f0', font: { size: 14 } },
                    legend: { labels: { color: '#ccc' } }
                },
                scales: {
                    x: { ticks: { color: '#aaa' }, grid: { color: '#2a2e37' } },
                    y: { ticks: { color: '#aaa' }, grid: { color: '#2a2e37' }, beginAtZero: true }
                }
            }
        });
    }

    // Wykres 2: Profit Gil per Poziom / Mapa
    const ctxGil = document.getElementById('gilChart')?.getContext('2d');
    if (ctxGil) {
        if (gilChartInstance) gilChartInstance.destroy();
        gilChartInstance = new Chart(ctxGil, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [
                    { label: 'Gil Profit', data: gilData.length ? gilData : [0], backgroundColor: '#e67e22' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Total Gil Profit by Map Level', color: '#f0f0f0', font: { size: 14 } },
                    legend: { labels: { color: '#ccc' } }
                },
                scales: {
                    x: { ticks: { color: '#aaa' }, grid: { color: '#2a2e37' } },
                    y: { ticks: { color: '#aaa' }, grid: { color: '#2a2e37' }, beginAtZero: true }
                }
            }
        });
    }
}