let currentLang = 'pl';
let mapsChartInstance = null;
let gilChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    if (typeof renderMapOptions === "function") {
        renderMapOptions();
    }
    setupLanguageSelector();
    setupOverlayToggle();

    // Domyślna dzisiejsza data w polu formularza
    const dateInput = document.getElementById("entryDate");
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

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
    const btnToggle = document.getElementById("toggleOverlayBtn");
    const btnExit = document.getElementById("exitOverlayBtn");

    if (btnToggle) {
        btnToggle.addEventListener("click", () => {
            document.body.classList.add("overlay-mode");
            if (btnExit) btnExit.classList.remove("hidden");
        });
    }

    if (btnExit) {
        btnExit.addEventListener("click", () => {
            document.body.classList.remove("overlay-mode");
            btnExit.classList.add("hidden");
        });
    }
}

function updateUI() {
    const data = typeof Storage !== "undefined" ? Storage.loadData() : [];
    const stats = (typeof Calculations !== "undefined" && Calculations.computeStats)
        ? Calculations.computeStats(data)
        : buildDefaultStats(data);

    updateStatCards(stats);
    renderTable(stats);
    updateCharts(stats);
}

function buildDefaultStats(data) {
    const mapDetails = MAPS_DATA.map(m => {
        const entries = data.filter(d => d.mapId === m.id);
        const maps = entries.reduce((acc, curr) => acc + Number(curr.mapsCount || 0), 0);
        const portals = entries.reduce((acc, curr) => acc + Number(curr.portalsCount || 0), 0);
        const clears = entries.reduce((acc, curr) => acc + Number(curr.clearsCount || 0), 0);
        const gil = entries.reduce((acc, curr) => acc + Number(curr.gilEarned || 0), 0);
        return { ...m, maps, portals, clears, gil };
    });

    const totalMaps = mapDetails.reduce((acc, m) => acc + m.maps, 0);
    const totalPortals = mapDetails.reduce((acc, m) => acc + m.portals, 0);
    const totalClears = mapDetails.reduce((acc, m) => acc + m.clears, 0);
    const totalGil = mapDetails.reduce((acc, m) => acc + m.gil, 0);

    return { totalMaps, totalPortals, totalClears, totalGil, mapDetails };
}

function updateStatCards(stats) {
    const portalRate = stats.totalMaps > 0 ? ((stats.totalPortals / stats.totalMaps) * 100).toFixed(1) : 0;
    const clearRate = stats.totalPortals > 0 ? ((stats.totalClears / stats.totalPortals) * 100).toFixed(1) : 0;

    document.getElementById("statTotalMaps").textContent = `${stats.totalMaps} (Portal: ${portalRate}%)`;
    document.getElementById("statTotalPortals").textContent = `${stats.totalPortals}`;
    document.getElementById("statCompletedDungeons").textContent = `${stats.totalClears} (Clear: ${clearRate}%)`;
    document.getElementById("statTotalGil").textContent = `${stats.totalGil.toLocaleString()} Gil`;
}

function renderTable(stats) {
    const tbody = document.getElementById("mapTableBody");
    if (!tbody) return;

    tbody.innerHTML = stats.mapDetails.map(m => {
        const avgGil = m.maps > 0 ? Math.round(m.gil / m.maps) : 0;
        return `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td>${m.type}</td>
        <td>Lv. ${m.level}</td>
        <td>${m.maps}</td>
        <td>${m.portals}</td>
        <td>${m.clears}</td>
        <td>${m.gil.toLocaleString()} Gil</td>
        <td>${avgGil.toLocaleString()} Gil</td>
        <td>
          <button class="btn-quick" onclick="quickAdd('${m.id}')">+1 Map</button>
        </td>
      </tr>
    `;
    }).join("");
}

function updateCharts(stats) {
    const langData = (typeof translations !== "undefined" && translations[currentLang]) ? translations[currentLang] : {};
    const activeStats = stats.mapDetails;

    const labels = activeStats.map(m => `[Lv.${m.level}] ${m.name}`);
    const mapsData = activeStats.map(m => m.maps);
    const portalsData = activeStats.map(m => m.portals);
    const clearsData = activeStats.map(m => m.clears);
    const gilData = activeStats.map(m => m.gil);

    // Wykres 1: Aktywność map/portali/clears rozbita na poziomy
    const ctxMaps = document.getElementById('mapsChart')?.getContext('2d');
    if (ctxMaps) {
        if (mapsChartInstance) mapsChartInstance.destroy();
        mapsChartInstance = new Chart(ctxMaps, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: langData.thMaps || 'Mapy', data: mapsData, backgroundColor: '#c5a059' },
                    { label: langData.thPortals || 'Portale', data: portalsData, backgroundColor: '#4a70a9' },
                    { label: langData.thClears || 'Clears', data: clearsData, backgroundColor: '#2ecc71' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: langData.chartMapsTitle || 'Aktywność według Poziomu Mapy', color: '#ffffff', font: { size: 13 } },
                    legend: { labels: { color: '#9aa0ac' } }
                },
                scales: {
                    x: { ticks: { color: '#7e8594', font: { size: 10 } }, grid: { color: '#232730' } },
                    y: { ticks: { color: '#7e8594' }, grid: { color: '#232730' }, beginAtZero: true }
                }
            }
        });
    }

    // Wykres 2: Profit w Gil rozbity na poziomy
    const ctxGil = document.getElementById('gilChart')?.getContext('2d');
    if (ctxGil) {
        if (gilChartInstance) gilChartInstance.destroy();
        gilChartInstance = new Chart(ctxGil, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Suma Gil', data: gilData, backgroundColor: '#9b59b6' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: langData.chartGilTitle || 'Zysk w Gil według Poziomu Mapy', color: '#ffffff', font: { size: 13 } },
                    legend: { labels: { color: '#9aa0ac' } }
                },
                scales: {
                    x: { ticks: { color: '#7e8594', font: { size: 10 } }, grid: { color: '#232730' } },
                    y: { ticks: { color: '#7e8594' }, grid: { color: '#232730' }, beginAtZero: true }
                }
            }
        });
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const entry = {
        date: document.getElementById("entryDate").value,
        mapId: document.getElementById("mapSelect").value,
        mapsCount: Number(document.getElementById("mapsCount").value),
        portalsCount: Number(document.getElementById("portalsCount").value),
        clearsCount: Number(document.getElementById("clearsCount").value),
        gilEarned: Number(document.getElementById("gilEarned").value)
    };

    if (typeof Storage !== "undefined") {
        const data = Storage.loadData();
        data.push(entry);
        Storage.saveData(data);
        updateUI();
    }
}

function quickAdd(mapId) {
    if (typeof Storage !== "undefined") {
        const data = Storage.loadData();
        data.push({
            date: new Date().toISOString().split('T')[0],
            mapId: mapId,
            mapsCount: 1,
            portalsCount: 0,
            clearsCount: 0,
            gilEarned: 0
        });
        Storage.saveData(data);
        updateUI();
    }
}