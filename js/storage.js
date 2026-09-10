const STORAGE_KEY = "FFXIV_MAP_TRACKER_DATA_V3";
const SESSIONS_KEY = "FFXIV_MAP_TRACKER_SESSIONS_V3";

export function loadState(defaultData) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultData;
        const parsed = JSON.parse(raw);
        return { ...defaultData, ...parsed };
    } catch (e) {
        console.error("Błąd odczytu z localStorage:", e);
        return defaultData;
    }
}

export function saveState(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Błąd zapisu do localStorage:", e);
    }
}

export function clearState() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSIONS_KEY);
}

export function saveSession(date, sessionData) {
    try {
        const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
        sessions.push({ date: date || new Date().toISOString().split('T')[0], data: sessionData });
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error("Błąd zapisu sesji:", e);
    }
}