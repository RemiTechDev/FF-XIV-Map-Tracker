// ============================================================================
// Dependencies
// ============================================================================
import { MAPS_DATABASE, getMapById, getMapLevels } from "./mapsData.js";
import {
    addSession,
    clearAppData,
    createDefaultAppData,
    deleteSession,
    loadAppData,
    replaceAppData,
    saveAppData,
    setSettings,
    updateSession
} from "./storage.js";
import {
    aggregateByMap,
    calculateTotals,
    filterSessions,
    formatNumber,
    formatPercent,
    sessionProfit
} from "./calculations.js";
import { applyTranslations, getLocale, t } from "./i18n.js";
import { renderStatisticsCharts, resizeStatisticsCharts } from "./statistics/charts.js";
import { exportCsv } from "./export/csvExport.js";
import { exportJson, readJsonFile } from "./export/jsonExport.js";
import { exportExcel } from "./export/excelExport.js";
import { exportOds } from "./export/odsExport.js";
import { exportDataPackage } from "./export/bundleExport.js";

// ============================================================================
// Application state
// ============================================================================
let appData = loadAppData();
let editingSessionId = null;
let toastTimer = null;

// ============================================================================
// DOM helpers and cached elements
// ============================================================================
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const elements = {
    language: $("#language"),
    calendar: $("#calendar"),
    mapSelect: $("#map-select"),
    maps: $("#num-maps"),
    portals: $("#num-portals"),
    clears: $("#num-clears"),
    earned: $("#earned-gil"),
    spent: $("#spent-gil"),
    note: $("#session-note"),
    form: $("#tracker-form"),
    formError: $("#form-error"),
    saveSessionBtn: $("#save-session-btn"),
    cancelEditBtn: $("#cancel-edit-btn"),
    mapMetaBadge: $("#map-meta-badge"),
    mapHelp: $("#map-help"),
    mapTableBody: $("#map-table tbody"),
    historyBody: $("#history-table tbody"),
    historyEmpty: $("#history-empty"),
    mapTypeFilter: $("#map-type-filter"),
    statsPeriod: $("#stats-period"),
    statsLevel: $("#stats-level"),
    sidebar: $("#sidebar"),
    mobileBackdrop: $("#mobile-backdrop"),
    toast: $("#toast"),
    compactExit: $("#compact-exit-btn")
};

// ============================================================================
// Formatting and persistence helpers
// ============================================================================
function currentLang() {
    return appData.settings.language || "PL";
}

function locale() {
    return getLocale(currentLang());
}

function money(value) {
    return formatNumber(value, locale());
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    toastTimer = setTimeout(() => {
        elements.toast.hidden = true;
    }, 3200);
}

function flashSaved() {
    const indicator = $("#save-indicator");
    if (!indicator) return;
    indicator.style.opacity = ".45";
    setTimeout(() => {
        indicator.style.opacity = "1";
    }, 160);
}

function persist() {
    appData = saveAppData(appData);
    flashSaved();
}

// ============================================================================
// Form setup and validation
// ============================================================================
function populateMapSelect() {
    elements.mapSelect.innerHTML = "";
    for (const map of MAPS_DATABASE) {
        const option = document.createElement("option");
        option.value = map.id;
        option.textContent = `[Lv.${map.level}] ${map.name} · ${map.type}`;
        elements.mapSelect.appendChild(option);
    }
}

function populateLevelFilter() {
    const selected = elements.statsLevel.value || "ALL";
    elements.statsLevel.innerHTML = `<option value="ALL" data-i18n="allLevels">${t(currentLang(), "allLevels")}</option>`;
    for (const level of getMapLevels()) {
        const option = document.createElement("option");
        option.value = String(level);
        option.textContent = `Lv. ${level}`;
        elements.statsLevel.appendChild(option);
    }
    elements.statsLevel.value = [...elements.statsLevel.options].some(o => o.value === selected) ? selected : "ALL";
}

function updateMapFormState() {
    const map = getMapById(elements.mapSelect.value);
    if (!map) return;
    elements.mapMetaBadge.textContent = `Lv.${map.level} · ${map.type}${map.portalEligible ? " · Portal" : ""}`;
    elements.mapHelp.textContent = map.portalEligible
        ? `${map.dungeon ?? "Treasure dungeon"} · portal eligible`
        : "No treasure dungeon portal for this map.";
    elements.portals.disabled = !map.portalEligible;
    elements.clears.disabled = !map.portalEligible;
    if (!map.portalEligible) {
        elements.portals.value = "0";
        elements.clears.value = "0";
    }
}

function setFormError(message = "") {
    elements.formError.textContent = message;
    elements.formError.hidden = !message;
}

function readForm() {
    const map = getMapById(elements.mapSelect.value);
    const session = {
        date: elements.calendar.value,
        mapId: elements.mapSelect.value,
        maps: Number(elements.maps.value),
        portals: Number(elements.portals.value),
        clears: Number(elements.clears.value),
        earnedGil: Number(elements.earned.value),
        spentGil: Number(elements.spent.value),
        note: elements.note.value.trim()
    };

    if (!map) {
        throw new Error("Select a valid map.");
    }

    if (!session.date) {
        throw new Error("Select a date.");
    }

    if (!Number.isInteger(session.maps) || session.maps < 1) {
        throw new Error("Maps completed must be at least 1.");
    }

    const numericValues = [
        session.portals,
        session.clears,
        session.earnedGil,
        session.spentGil
    ];

    if (!numericValues.every(value => Number.isFinite(value) && value >= 0)) {
        throw new Error("Values cannot be negative.");
    }

    if (!Number.isInteger(session.portals) || !Number.isInteger(session.clears)) {
        throw new Error("Portals and clears must be whole numbers.");
    }

    if (!map.portalEligible && (session.portals > 0 || session.clears > 0)) {
        throw new Error("This map does not have a treasure dungeon portal.");
    }

    if (session.portals > session.maps) {
        throw new Error("Portals cannot exceed completed maps in one session.");
    }

    if (session.clears > session.portals) {
        throw new Error("Dungeon clears cannot exceed opened portals.");
    }

    return session;
}

function resetForm() {
    editingSessionId = null;
    elements.form.reset();
    elements.calendar.value = today();
    elements.maps.value = "1";
    elements.portals.value = "0";
    elements.clears.value = "0";
    elements.earned.value = "0";
    elements.spent.value = "0";
    elements.saveSessionBtn.textContent = t(currentLang(), "addSession");
    $("#session-form-title").textContent = t(currentLang(), "addSession");
    elements.cancelEditBtn.hidden = true;
    setFormError();
    updateMapFormState();
}

function startEdit(sessionId) {
    const session = appData.sessions.find(row => row.id === sessionId);
    if (!session) return;
    editingSessionId = sessionId;
    elements.calendar.value = session.date ?? "";
    elements.mapSelect.value = session.mapId;
    elements.maps.value = String(session.maps);
    elements.portals.value = String(session.portals);
    elements.clears.value = String(session.clears);
    elements.earned.value = String(session.earnedGil);
    elements.spent.value = String(session.spentGil);
    elements.note.value = session.note ?? "";
    elements.saveSessionBtn.textContent = t(currentLang(), "saveChanges");
    $("#session-form-title").textContent = t(currentLang(), "saveChanges");
    elements.cancelEditBtn.hidden = false;
    updateMapFormState();
    location.hash = "#tracker";
    $("#tracker-form").scrollIntoView({ behavior: "smooth", block: "center" });
}

// ============================================================================
// Tracker rendering
// ============================================================================
function renderSummary(sessions = appData.sessions) {
    const totals = calculateTotals(sessions);
    $("#total-maps").textContent = money(totals.totalMaps);
    $("#total-portals").textContent = money(totals.totalPortals);
    $("#total-clears").textContent = money(totals.totalClears);
    $("#total-earned").textContent = money(totals.earnedGil);
    $("#total-spent").textContent = money(totals.spentGil);
    $("#total-profit").textContent = money(totals.profitGil);
    $("#portal-rate-hint").textContent = `${formatPercent(totals.portalRate, locale())} portal rate`;
    $("#clear-rate-hint").textContent = `${formatPercent(totals.clearRate, locale())} clear rate`;
}

function renderMapTable() {
    let rows = aggregateByMap(appData.sessions);
    const filter = elements.mapTypeFilter.value;
    if (filter === "PARTY") {
        rows = rows.filter(row => row.type === "Party");
    }

    if (filter === "SOLO") {
        rows = rows.filter(row => row.type === "Solo");
    }

    if (filter === "PORTAL") {
        rows = rows.filter(row => row.portalEligible);
    }
    rows.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));

    elements.mapTableBody.innerHTML = rows.map(row => {
        const profitClass = row.profitGil > 0
            ? "number-positive"
            : row.profitGil < 0
                ? "number-negative"
                : "";

        const dungeonLabel = row.dungeon
            ?? (row.portalEligible ? "Portal eligible" : "No portal");

        return `<tr>
            <td class="map-name-cell">
                <strong>${escapeHtml(row.name)}</strong>
                <small>${escapeHtml(dungeonLabel)}</small>
            </td>
            <td>${row.level}</td>
            <td>${row.type}</td>
            <td>${money(row.maps)}</td>
            <td>${row.portalEligible ? money(row.portals) : "—"}</td>
            <td>${row.portalEligible ? formatPercent(row.portalRate, locale()) : "—"}</td>
            <td>${row.portalEligible ? money(row.clears) : "—"}</td>
            <td>${money(row.earnedGil)}</td>
            <td>${money(row.spentGil)}</td>
            <td class="${profitClass}">${money(row.profitGil)}</td>
        </tr>`;
    }).join("");
}

function renderHistory() {
    const sessions = [...appData.sessions].sort((a, b) => {
        const dateA = a.date ?? "0000-00-00";
        const dateB = b.date ?? "0000-00-00";
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return String(b.createdAt).localeCompare(String(a.createdAt));
    });

    elements.historyEmpty.hidden = sessions.length > 0;
    elements.historyBody.innerHTML = sessions.map(session => {
        const map = getMapById(session.mapId);
        const profit = sessionProfit(session);
        const profitClass = profit > 0
            ? "number-positive"
            : profit < 0
                ? "number-negative"
                : "";

        const legacyBadge = session.source === "legacy-v3"
            ? '<span class="legacy-badge">legacy</span>'
            : "";

        const note = session.note
            ? `<small title="${escapeHtml(session.note)}">${escapeHtml(truncate(session.note, 46))}</small>`
            : "";

        return `<tr>
            <td>${session.date ?? "—"}${legacyBadge}</td>
            <td class="map-name-cell">
                <strong>${escapeHtml(map?.name ?? session.mapId)}</strong>
                ${note}
            </td>
            <td>${money(session.maps)}</td>
            <td>${map?.portalEligible ? money(session.portals) : "—"}</td>
            <td>${map?.portalEligible ? money(session.clears) : "—"}</td>
            <td>${money(session.earnedGil)}</td>
            <td>${money(session.spentGil)}</td>
            <td class="${profitClass}">${money(profit)}</td>
            <td>
                <div class="table-actions">
                    <button type="button" class="mini-btn" data-action="edit" data-id="${session.id}">
                        ${t(currentLang(), "edit")}
                    </button>
                    <button type="button" class="mini-btn delete" data-action="delete" data-id="${session.id}">
                        ${t(currentLang(), "delete")}
                    </button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function truncate(value, length) {
    const text = String(value ?? "");
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

// ============================================================================
// Statistics rendering
// ============================================================================
function statsSessions() {
    return filterSessions(appData.sessions, {
        period: elements.statsPeriod.value,
        level: elements.statsLevel.value
    });
}

function renderStatistics() {
    const sessions = statsSessions();
    const totals = calculateTotals(sessions);
    $("#stats-portal-rate").textContent = formatPercent(totals.portalRate, locale());
    $("#stats-clear-rate").textContent = formatPercent(totals.clearRate, locale());
    $("#stats-avg-profit").textContent = money(Math.round(totals.avgProfitPerMap));
    $("#stats-profit").textContent = money(totals.profitGil);
    renderStatisticsCharts(sessions);
}

function renderAll() {
    renderSummary();
    renderMapTable();
    renderHistory();
    if (location.hash === "#statistics") renderStatistics();
}

// ============================================================================
// Navigation, language and compact mode
// ============================================================================
function viewMeta(view) {
    const lang = currentLang();
    const meta = {
        PL: {
            tracker: ["DZIENNIK TREASURE MAP", "Tracker"],
            statistics: ["ANALIZA DANYCH", "Statystyki"],
            guide: ["JAK KORZYSTAĆ", "Poradnik"],
            about: ["PROJEKT", "O aplikacji"]
        },
        ENG: {
            tracker: ["TREASURE JOURNAL", "Tracker"],
            statistics: ["DATA ANALYTICS", "Statistics"],
            guide: ["HOW TO USE", "Guide"],
            about: ["PROJECT", "About"]
        },
        FR: {
            tracker: ["JOURNAL DE CARTES", "Suivi"],
            statistics: ["ANALYSE DES DONNÉES", "Statistiques"],
            guide: ["MODE D'EMPLOI", "Guide"],
            about: ["PROJET", "À propos"]
        }
    };
    return meta[lang]?.[view] ?? meta.ENG[view];
}

function showView(view) {
    const valid = ["tracker", "statistics", "guide", "about"].includes(view) ? view : "tracker";
    $$('[data-view-panel]').forEach(panel => {
        const active = panel.dataset.viewPanel === valid;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
    });
    $$(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.view === valid));
    const [eyebrow, title] = viewMeta(valid);
    $("#view-eyebrow").textContent = eyebrow;
    $("#view-title").textContent = title;
    closeMobileMenu();
    if (valid === "statistics") {
        requestAnimationFrame(() => {
            renderStatistics();
            resizeStatisticsCharts();
        });
    }
}

function applyLanguage(lang) {
    appData = setSettings(appData, { language: lang });
    elements.language.value = lang;
    applyTranslations(lang);
    populateLevelFilter();
    updateMapFormState();
    elements.saveSessionBtn.textContent = editingSessionId
        ? t(lang, "saveChanges")
        : t(lang, "addSession");
    renderAll();
    showView((location.hash || "#tracker").slice(1));
}

function setCompactMode(enabled) {
    document.body.classList.toggle("overlay-mode", enabled);
    elements.compactExit.hidden = !enabled;
    appData = setSettings(appData, { compactMode: enabled });
    if (enabled && location.hash !== "#tracker") {
        location.hash = "#tracker";
    }
}

function openMobileMenu() {
    elements.sidebar.classList.add("open");
    elements.mobileBackdrop.hidden = false;
}

function closeMobileMenu() {
    elements.sidebar.classList.remove("open");
    elements.mobileBackdrop.hidden = true;
}

// ============================================================================
// Export helper
// ============================================================================
async function runExport(button, action, successMessage) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "…";
    try {
        await action();
        showToast(successMessage);
    } catch (error) {
        console.error(error);
        showToast(`Export error: ${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = original;
    }
}

// ============================================================================
// Event wiring
// ============================================================================
function wireEvents() {
    window.addEventListener("hashchange", () => {
        showView((location.hash || "#tracker").slice(1));
    });

    elements.language.addEventListener("change", event => {
        applyLanguage(event.target.value);
    });

    elements.mapSelect.addEventListener("change", updateMapFormState);
    elements.mapTypeFilter.addEventListener("change", renderMapTable);
    elements.statsPeriod.addEventListener("change", renderStatistics);
    elements.statsLevel.addEventListener("change", renderStatistics);

    elements.form.addEventListener("submit", event => {
        event.preventDefault();
        try {
            setFormError();
            const session = readForm();
            const wasEditing = Boolean(editingSessionId);
            if (editingSessionId) {
                appData = updateSession(appData, editingSessionId, session);
            } else {
                appData = addSession(appData, session);
            }
            renderAll();
            resetForm();
            showToast(wasEditing ? "Session updated." : "Session saved.");
        } catch (error) {
            setFormError(error.message);
        }
    });

    elements.cancelEditBtn.addEventListener("click", resetForm);

    elements.historyBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");
        if (!button) {
            return;
        }

        const id = button.dataset.id;

        if (button.dataset.action === "edit") {
            startEdit(id);
        }

        if (button.dataset.action === "delete") {
            if (!confirm("Delete this session?")) {
                return;
            }

            appData = deleteSession(appData, id);

            if (editingSessionId === id) {
                resetForm();
            }
            renderAll();
            showToast("Session deleted.");
        }
    });

    $("#reset-all-btn").addEventListener("click", () => {
        if (!confirm("This will permanently remove all locally stored tracker data. Continue?")) {
            return;
        }
        clearAppData();
        appData = createDefaultAppData();
        persist();
        applyLanguage(appData.settings.language);
        resetForm();
        renderAll();
        showToast("All tracker data was reset.");
    });

    $("#toggle-overlay-btn").addEventListener("click", () => {
        setCompactMode(!document.body.classList.contains("overlay-mode"));
    });
    elements.compactExit.addEventListener("click", () => setCompactMode(false));
    $("#mobile-menu-btn").addEventListener("click", openMobileMenu);
    elements.mobileBackdrop.addEventListener("click", closeMobileMenu);
    $$(".nav-link").forEach(link => link.addEventListener("click", closeMobileMenu));

    $("#export-csv-btn").addEventListener("click", event => {
        runExport(
            event.currentTarget,
            () => exportCsv(appData.sessions),
            t(currentLang(), "csvExported")
        );
    });

    $("#export-json-btn").addEventListener("click", event => {
        runExport(
            event.currentTarget,
            () => exportJson(appData),
            t(currentLang(), "jsonBackupExported")
        );
    });

    $("#export-ods-btn").addEventListener("click", event => {
        runExport(
            event.currentTarget,
            () => exportOds(appData),
            t(currentLang(), "odsExported")
        );
    });

    $("#export-xlsx-btn").addEventListener("click", event => {
        runExport(
            event.currentTarget,
            () => exportExcel(appData),
            t(currentLang(), "xlsxExported")
        );
    });

    $("#export-all-btn").addEventListener("click", event => {
        runExport(
            event.currentTarget,
            () => exportDataPackage(appData),
            t(currentLang(), "dataPackageExported")
        );
    });

    $("#import-json-btn").addEventListener("click", () => $("#import-json-file").click());
    $("#import-json-file").addEventListener("change", async event => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) {
            return;
        }
        try {
            const imported = await readJsonFile(file);
            const sessionCount = imported.sessions?.length ?? 0;
            const confirmed = confirm(
                t(currentLang(), "restoreConfirm").replace("{count}", sessionCount)
            );

            if (!confirmed) {
                return;
            }
            appData = replaceAppData(imported);
            elements.language.value = appData.settings.language;
            applyLanguage(appData.settings.language);
            resetForm();
            renderAll();
            showToast(t(currentLang(), "backupRestored"));
        } catch (error) {
            console.error(error);
            showToast(`Import error: ${error.message}`);
        }
    });
}

// ============================================================================
// Application bootstrap
// ============================================================================
function init() {
    populateMapSelect();
    elements.language.value = appData.settings.language;
    applyTranslations(appData.settings.language);
    populateLevelFilter();
    elements.calendar.value = today();
    updateMapFormState();
    document.body.classList.toggle("overlay-mode", Boolean(appData.settings.compactMode));
    elements.compactExit.hidden = !appData.settings.compactMode;
    wireEvents();
    renderAll();
    const initialView = (location.hash || "#tracker").slice(1);
    showView(initialView);
}

init();
