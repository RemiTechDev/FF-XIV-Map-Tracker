const Storage = {
    KEY: 'ffxiv_map_tracker_data',

    loadData() {
        try {
            const raw = localStorage.getItem(this.KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Błąd podczas ładowania danych z localStorage:", e);
            return [];
        }
    },

    saveData(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Błąd podczas zapisywania danych do localStorage:", e);
        }
    }
};