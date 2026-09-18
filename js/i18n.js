// ============================================================================
// Translation dictionaries
// ============================================================================

// Keep the same keys in PL, ENG and FR. The UI falls back to English
// when a translation key is missing from the selected language.
const dictionaries = {
    PL: {
        // Branding & navigation
        brandTagline: "Dziennik map i statystyki",
        navTracker: "Tracker",
        navStatistics: "Statystyki",
        navGuide: "Poradnik",
        navAbout: "O aplikacji",
        language: "Język",
        compactMode: "Tryb kompaktowy",
        savedLocally: "Zapisano lokalnie",

        // Tracker summary
        totalMaps: "Razem map",
        allRecordedRuns: "Wszystkie zapisane mapy",
        totalPortals: "Portale",
        totalClears: "Ukończone lochy",
        earnedGil: "Zarobiony Gil",
        spentGil: "Wydany Gil",
        netProfit: "Zysk netto",

        // Session form
        sessionEntryEyebrow: "NOWA SESJA",
        addSession: "Dodaj sesję",
        date: "Data",
        map: "Mapa",
        mapsCompleted: "Ukończone mapy",
        portalsOpened: "Otwarte portale",
        dungeonClears: "Ukończone lochy",
        mapCostTotal: "Koszt zakupu map (łącznie)",
        noteOptional: "Notatka (opcjonalnie)",
        notePlaceholder: "Party, trasa, specjalny drop...",
        cancelEdit: "Anuluj edycję",
        saveChanges: "Zapisz zmiany",
        edit: "Edytuj",
        delete: "Usuń",

        // Map overview & history
        mapOverviewEyebrow: "PRZEGLĄD MAP",
        mapPerformance: "Wyniki map",
        allTypes: "Wszystkie typy",
        portalEligible: "Z portalem",
        level: "Poziom",
        type: "Typ",
        maps: "Mapy",
        portals: "Portale",
        portalRate: "Portal rate",
        clears: "Clears",
        earned: "Zarobiono",
        spent: "Wydano",
        profit: "Zysk",
        historyEyebrow: "HISTORIA",
        sessionHistory: "Historia sesji",
        resetAll: "Usuń wszystkie dane",
        actions: "Akcje",
        noSessions: "Brak zapisanych sesji",
        noSessionsHint: "Dodaj pierwszą sesję za pomocą formularza.",

        // Statistics
        analyticsEyebrow: "ANALITYKA",
        statisticsDashboard: "Panel statystyk",
        statisticsIntro: "Analizuj liczbę map, portale oraz rentowność w Gil.",
        allTime: "Cały okres",
        last30Days: "Ostatnie 30 dni",
        last90Days: "Ostatnie 90 dni",
        lastYear: "Ostatnie 365 dni",
        allLevels: "Wszystkie poziomy",
        eligibleMapsOnly: "Tylko mapy z portalem",
        clearRate: "Clear rate",
        ofOpenedPortals: "Z otwartych portali",
        avgProfitMap: "Śr. zysk / mapa",
        mapsPortalsByLevel: "Mapy i portale według poziomu",
        gilOverTime: "Gil w czasie",
        profitByMap: "Zysk według mapy",
        portalRateByMap: "Portal rate według mapy",

        // Guide & FAQ
        guideEyebrow: "JAK KORZYSTAĆ",
        guideTitle: "Poradnik",
        guideIntro: "Krótka instrukcja trackera, statystyk i kopii zapasowych.",
        guideStep1Short: "Wybierz mapę",
        guideStep2Short: "Wpisz wyniki",
        guideStep3Short: "Zapisz sesję",
        guideStep4Short: "Sprawdź statystyki",
        guideStep5Short: "Zrób backup",
        guideChooseTitle: "Wybierz Treasure Map",
        guideChooseText: "Wybierz mapę, którą robisz. Aplikacja zna jej poziom, typ oraz informację, czy może otworzyć " +
            "portal do treasure dungeonu.",
        guideResultsTitle: "Wpisz wynik sesji",
        guideResultsText: "Zapisz liczbę ukończonych map, otwartych portali, clearów, zarobiony Gil oraz łączny " +
            "koszt zakupu map.",
        guideStatsTitle: "Czytaj statystyki",
        guideStatsText: "Portal rate liczony jest wyłącznie dla map, które mogą otworzyć portal. Clear rate " +
            "liczony jest z otwartych portali. Zysk to zarobiony Gil minus koszt map.",
        guideBackupTitle: "Eksport i przywracanie",
        guideBackupText: "Sama aplikacja zostaje na GitHub Pages. JSON służy do przenoszenia i odtwarzania" +
            " wyłącznie danych trackera, a XLSX, ODS i CSV są raportami.",
        faqTitle: "Najczęstsze pytania",
        faqPortalQ: "Co jest liczone do portal rate?",
        faqPortalA: "Mianownikiem są wyłącznie ukończone mapy oznaczone w bazie jako mogące otworzyć portal.",
        faqProfitQ: "Czym jest zysk netto?",
        faqProfitA: "Zysk netto = zarobiony Gil − łączny koszt zakupionych map.",
        faqStorageQ: "Gdzie zapisują się moje dane?",
        faqStorageA: "Dane są zapisywane w tej przeglądarce przez localStorage. Aktualizacja aplikacji pod tym" +
            " samym adresem GitHub Pages nie wymaga kopiowania aplikacji; przed czyszczeniem danych witryny lub " +
            "zmianą urządzenia pobierz backup JSON.",
        faqLegacyQ: "Co stanie się ze starymi danymi V3?",
        faqLegacyA: "Aplikacja przenosi sumy V3 do sesji legacy. Stary format nie przechowywał dat ani kosztów map, " +
            "więc wpisy bez daty nie są używane na wykresach czasowych.",

        // About
        aboutHeadline: "Track. Analyze. Profit.",
        aboutLead: "Lokalny tracker sesji Treasure Map w Final Fantasy XIV: mapy, portale, dungeon clears i " +
            "rentowność w Gil.",
        aboutAppEyebrow: "O APLIKACJI",
        aboutAppTitle: "Stworzona do śledzenia Treasure Maps",
        aboutAppText: "FFXIV Map Tracker zapisuje każdą sesję osobno, a następnie wylicza z historii sumy map, " +
            "statystyki poziomów, portal rate i wyniki finansowe.",
        privacyEyebrow: "TWOJE DANE",
        privacyTitle: "Przechowywane lokalnie",
        privacyText: "Kod aplikacji jest hostowany przez GitHub Pages. Dane trackera są przechowywane osobno w " +
            "localStorage tej przeglądarki i można je przenieść przez backup JSON.",
        exportEyebrow: "RAPORTY",
        exportTitle: "Przenośne raporty i backupy",
        exportText: "Generuj raporty z lokalnych danych albo pobierz backup JSON. Eksport zawiera dane trackera, " +
            "a nie kopię aplikacji z GitHub Pages.",
        legalTitle: "Informacja prawna",
        legalText: "FINAL FANTASY XIV oraz powiązane nazwy, znaki i zasoby należą do Square Enix Holdings Co., Ltd. " +
            "Ten fanowski tracker nie jest powiązany ze Square Enix ani przez nią wspierany.",

        // Export & backup
        exportBackupEyebrow: "EKSPORT I BACKUP",
        exportBackupTitle: "Zadbaj o swoje dane",
        exportBackupIntro: "Twórz czytelne raporty, zapisuj kopię zapasową swoich postępów i przywracaj dane w" +
            " dowolnym momencie.",
        reportsLabel: "Raporty",
        reportsHint: "Zapisz wyniki do Excel, LibreOffice lub dalszej analizy",
        backupLabel: "Backup danych",
        backupHint: "Bezpiecznie zapisz swoje postępy lub przywróć je na innym urządzeniu",
        downloadJsonBackup: "Pobierz backup JSON",
        restoreJsonBackup: "Przywróć backup JSON",
        downloadDataPackage: "Pobierz komplet danych (.zip)",
        dataPackageHint: "Raporty i kopia zapasowa w jednym pliku ZIP.",
        xlsxExported: "Raport XLSX został pobrany.",
        odsExported: "Raport ODS został pobrany.",
        csvExported: "Dane CSV zostały pobrane.",
        jsonBackupExported: "Backup JSON został pobrany.",
        dataPackageExported: "Pakiet danych ZIP został pobrany.",
        restoreConfirm: "Przywrócić {count} sesji i zastąpić aktualne lokalne dane?",
        backupRestored: "Backup danych został przywrócony."

    },
    ENG: {
        // Branding & navigation
        brandTagline: "Treasure Map journal & analytics",
        navTracker: "Tracker",
        navStatistics: "Statistics",
        navGuide: "Guide",
        navAbout: "About",
        language: "Language",
        compactMode: "Compact mode",
        savedLocally: "Saved locally",

        // Tracker summary
        totalMaps: "Total maps",
        allRecordedRuns: "All recorded runs",
        totalPortals: "Portals",
        totalClears: "Dungeon clears",
        earnedGil: "Gil earned",
        spentGil: "Gil spent",
        netProfit: "Net profit",

        // Session form
        sessionEntryEyebrow: "SESSION ENTRY",
        addSession: "Add session",
        date: "Date",
        map: "Map",
        mapsCompleted: "Maps completed",
        portalsOpened: "Portals opened",
        dungeonClears: "Dungeon clears",
        mapCostTotal: "Map purchase cost (total)",
        noteOptional: "Note (optional)",
        notePlaceholder: "Party, route, special drop...",
        cancelEdit: "Cancel edit",
        saveChanges: "Save changes",
        edit: "Edit",
        delete: "Delete",

        // Map overview & history
        mapOverviewEyebrow: "MAP OVERVIEW",
        mapPerformance: "Map performance",
        allTypes: "All types",
        portalEligible: "Portal eligible",
        level: "Level",
        type: "Type",
        maps: "Maps",
        portals: "Portals",
        portalRate: "Portal rate",
        clears: "Clears",
        earned: "Earned",
        spent: "Spent",
        profit: "Profit",
        historyEyebrow: "HISTORY",
        sessionHistory: "Session history",
        resetAll: "Reset all data",
        actions: "Actions",
        noSessions: "No sessions yet",
        noSessionsHint: "Add your first map run using the form above.",

        // Statistics
        analyticsEyebrow: "ANALYTICS",
        statisticsDashboard: "Statistics dashboard",
        statisticsIntro: "Explore map volume, portal performance and Gil profitability.",
        allTime: "All time",
        last30Days: "Last 30 days",
        last90Days: "Last 90 days",
        lastYear: "Last 365 days",
        allLevels: "All levels",
        eligibleMapsOnly: "Eligible maps only",
        clearRate: "Clear rate",
        ofOpenedPortals: "Of opened portals",
        avgProfitMap: "Avg. profit / map",
        mapsPortalsByLevel: "Maps & portals by level",
        gilOverTime: "Gil over time",
        profitByMap: "Profit by map",
        portalRateByMap: "Portal rate by map",

        // Guide & FAQ
        guideEyebrow: "HOW TO USE",
        guideTitle: "Guide",
        guideIntro: "A quick walkthrough of the tracker, statistics and backups.",
        guideStep1Short: "Choose a map",
        guideStep2Short: "Enter results",
        guideStep3Short: "Save session",
        guideStep4Short: "Check statistics",
        guideStep5Short: "Create a backup",
        guideChooseTitle: "Select a Treasure Map",
        guideChooseText: "Choose the map you are running. The app automatically knows its level, type and whether " +
            "it can open a treasure dungeon portal.",
        guideResultsTitle: "Enter the session results",
        guideResultsText: "Record completed maps, opened portals, dungeon clears, earned Gil and the total purchase " +
            "cost of the maps.",
        guideStatsTitle: "Read the statistics",
        guideStatsText: "Portal rate is calculated only from portal-eligible maps. Clear rate is calculated from " +
            "opened portals. Profit equals earned Gil minus map purchase cost.",
        guideBackupTitle: "Export & restore",
        guideBackupText: "The app itself stays on GitHub Pages. Use JSON to move or restore only your tracker data; " +
            "XLSX, ODS and CSV are generated reports.",
        faqTitle: "Frequently asked questions",
        faqPortalQ: "What counts toward portal rate?",
        faqPortalA: "Only completed maps marked as portal eligible in the map database are used as the denominator.",
        faqProfitQ: "What is net profit?",
        faqProfitA: "Net profit = Gil earned − total cost of purchased maps.",
        faqStorageQ: "Where is my data stored?",
        faqStorageA: "Your data is stored in this browser using localStorage. Updating the app on the same GitHub " +
            "Pages site does not require copying the app files; export JSON before clearing site data or moving to " +
            "another device.",
        faqLegacyQ: "What happens to older V3 data?",
        faqLegacyA: "The app migrates existing V3 totals into legacy sessions. Their original dates and historical " +
            "map costs were not stored, so time-based charts exclude entries without a known date.",

        // About
        aboutHeadline: "Track. Analyze. Profit.",
        aboutLead: "A local-first companion for Final Fantasy XIV Treasure Map sessions, portals, dungeon clears " +
            "and Gil profitability.",
        aboutAppEyebrow: "ABOUT APP",
        aboutAppTitle: "Built for Treasure Map tracking",
        aboutAppText: "FFXIV Map Tracker records each session separately, then derives map totals, level " +
            "statistics, portal rates and financial results from the session history.",
        privacyEyebrow: "YOUR DATA",
        privacyTitle: "Stored locally",
        privacyText: "GitHub Pages hosts the application code. Your tracker records are stored separately in " +
            "this browser using localStorage and can be moved with a JSON backup.",
        exportEyebrow: "REPORTING",
        exportTitle: "Portable reports & backups",
        exportText: "Generate reports from your local data or download a JSON backup. Export files contain your " +
            "tracker data, not a copy of the GitHub Pages application.",
        legalTitle: "Legal notice",
        legalText: "FINAL FANTASY XIV and related names, marks and assets are the property of Square Enix Holdings Co., " +
            "Ltd. This fan-made tracker is not affiliated with or endorsed by Square Enix.",

        // Export & backup
        exportBackupEyebrow: "EXPORT & BACKUP",
        exportBackupTitle: "Keep your progress safe",
        exportBackupIntro: "Create clear reports, save a backup of your progress, and restore your data whenever " +
            "you need it.",
        reportsLabel: "Reports",
        reportsHint: "Export your results for Excel, LibreOffice, or further analysis",
        backupLabel: "Data backup",
        backupHint: "Save your progress safely or restore it on another device",
        downloadJsonBackup: "Download JSON backup",
        restoreJsonBackup: "Restore JSON backup",
        downloadDataPackage: "Download complete data package (.zip)",
        dataPackageHint: "Reports and a backup together in one ZIP file.",
        xlsxExported: "XLSX report downloaded.",
        odsExported: "ODS report downloaded.",
        csvExported: "CSV data downloaded.",
        jsonBackupExported: "JSON backup downloaded.",
        dataPackageExported: "Data ZIP package downloaded.",
        restoreConfirm: "Restore {count} sessions and replace the current local data?",
        backupRestored: "Data backup restored successfully."

    },
    FR: {
        // Branding & navigation
        brandTagline: "Journal de cartes et statistiques",
        navTracker: "Suivi",
        navStatistics: "Statistiques",
        navGuide: "Guide",
        navAbout: "À propos",
        language: "Langue",
        compactMode: "Mode compact",
        savedLocally: "Enregistré localement",

        // Tracker summary
        totalMaps: "Cartes totales",
        allRecordedRuns: "Toutes les cartes enregistrées",
        totalPortals: "Portails",
        totalClears: "Donjons terminés",
        earnedGil: "Gils gagnés",
        spentGil: "Gils dépensés",
        netProfit: "Profit net",

        // Session form
        sessionEntryEyebrow: "SESSION",
        addSession: "Ajouter la session",
        date: "Date",
        map: "Carte",
        mapsCompleted: "Cartes terminées",
        portalsOpened: "Portails ouverts",
        dungeonClears: "Donjons terminés",
        mapCostTotal: "Coût total des cartes",
        noteOptional: "Note (facultatif)",
        notePlaceholder: "Groupe, route, objet spécial...",
        cancelEdit: "Annuler",
        saveChanges: "Enregistrer",
        edit: "Modifier",
        delete: "Supprimer",

        // Map overview & history
        mapOverviewEyebrow: "APERÇU DES CARTES",
        mapPerformance: "Performance des cartes",
        allTypes: "Tous les types",
        portalEligible: "Avec portail",
        level: "Niveau",
        type: "Type",
        maps: "Cartes",
        portals: "Portails",
        portalRate: "Taux de portail",
        clears: "Clears",
        earned: "Gagné",
        spent: "Dépensé",
        profit: "Profit",
        historyEyebrow: "HISTORIQUE",
        sessionHistory: "Historique des sessions",
        resetAll: "Effacer toutes les données",
        actions: "Actions",
        noSessions: "Aucune session",
        noSessionsHint: "Ajoutez votre première session avec le formulaire.",

        // Statistics
        analyticsEyebrow: "ANALYSE",
        statisticsDashboard: "Tableau de statistiques",
        statisticsIntro: "Analysez les cartes, les portails et la rentabilité en Gils.",
        allTime: "Toute la période",
        last30Days: "30 derniers jours",
        last90Days: "90 derniers jours",
        lastYear: "365 derniers jours",
        allLevels: "Tous les niveaux",
        eligibleMapsOnly: "Cartes éligibles uniquement",
        clearRate: "Taux de clear",
        ofOpenedPortals: "Des portails ouverts",
        avgProfitMap: "Profit moyen / carte",
        mapsPortalsByLevel: "Cartes et portails par niveau",
        gilOverTime: "Gils dans le temps",
        profitByMap: "Profit par carte",
        portalRateByMap: "Taux de portail par carte",

        // Guide & FAQ
        guideEyebrow: "MODE D'EMPLOI",
        guideTitle: "Guide",
        guideIntro: "Guide rapide du tracker, des statistiques et des sauvegardes.",
        guideStep1Short: "Choisir une carte",
        guideStep2Short: "Entrer les résultats",
        guideStep3Short: "Enregistrer",
        guideStep4Short: "Voir les statistiques",
        guideStep5Short: "Créer une sauvegarde",
        guideChooseTitle: "Sélectionnez une Treasure Map",
        guideChooseText: "Choisissez la carte jouée. L'application connaît son niveau, son type et si elle peut" +
            " ouvrir un portail de donjon.",
        guideResultsTitle: "Entrez les résultats",
        guideResultsText: "Enregistrez les cartes terminées, les portails ouverts, les clears, les Gils gagnés et le" +
            " coût total des cartes.",
        guideStatsTitle: "Lisez les statistiques",
        guideStatsText: "Le taux de portail utilise uniquement les cartes éligibles. Le taux de clear est calculé à " +
            "partir des portails ouverts. Le profit est égal aux Gils gagnés moins le coût des cartes.",
        guideBackupTitle: "Export et restauration",
        guideBackupText: "L’application reste sur GitHub Pages. Utilisez JSON pour déplacer ou restaurer uniquement " +
            "les données du tracker ; XLSX, ODS et CSV sont des rapports.",
        faqTitle: "Questions fréquentes",
        faqPortalQ: "Qu'est-ce qui compte dans le taux de portail ?",
        faqPortalA: "Seules les cartes terminées marquées comme éligibles au portail servent de dénominateur.",
        faqProfitQ: "Qu'est-ce que le profit net ?",
        faqProfitA: "Profit net = Gils gagnés − coût total des cartes achetées.",
        faqStorageQ: "Où sont stockées mes données ?",
        faqStorageA: "Vos données sont stockées dans ce navigateur via localStorage. Une mise à jour de l’application " +
            "sur le même site GitHub Pages ne nécessite pas de copier l’application ; exportez JSON avant d’effacer " +
            "les données du site ou de changer d’appareil.",
        faqLegacyQ: "Que deviennent les anciennes données V3 ?",
        faqLegacyA: "L'application migre les totaux V3 vers des sessions legacy. Les anciennes données ne contenaient " +
            "ni dates ni coûts, donc les entrées sans date sont exclues des graphiques temporels.",

        // About
        aboutHeadline: "Track. Analyze. Profit.",
        aboutLead: "Un outil local pour suivre les Treasure Maps de FINAL FANTASY XIV, les portails, les clears et" +
            " la rentabilité en Gils.",
        aboutAppEyebrow: "À PROPOS",
        aboutAppTitle: "Conçu pour les Treasure Maps",
        aboutAppText: "FFXIV Map Tracker enregistre chaque session séparément puis calcule les totaux, statistiques " +
            "de niveaux, taux de portail et résultats financiers.",
        privacyEyebrow: "VOS DONNÉES",
        privacyTitle: "Stockées localement",
        privacyText: "Le code de l’application est hébergé sur GitHub Pages. Les données du tracker sont stockées " +
            "séparément dans le localStorage du navigateur et peuvent être déplacées avec une sauvegarde JSON.",
        exportEyebrow: "RAPPORTS",
        exportTitle: "Rapports et sauvegardes portables",
        exportText: "Créez des rapports à partir des données locales ou téléchargez une sauvegarde JSON. Les exports" +
            " contiennent les données du tracker, pas une copie de l’application GitHub Pages.",
        legalTitle: "Mentions légales",
        legalText: "FINAL FANTASY XIV ainsi que les noms, marques et ressources associés appartiennent à Square Enix " +
            "Holdings Co., Ltd. Ce tracker créé par des fans n'est ni affilié à Square Enix ni approuvé par celle-ci.",

        // Export & backup
        exportBackupEyebrow: "EXPORT ET SAUVEGARDE",
        exportBackupTitle: "Protégez votre progression",
        exportBackupIntro: "Créez des rapports clairs, sauvegardez votre progression et restaurez vos données à " +
            "tout moment.",
        reportsLabel: "Rapports",
        reportsHint: "Exportez vos résultats vers Excel, LibreOffice ou pour une analyse approfondie",
        backupLabel: "Sauvegarde des données",
        backupHint: "Sauvegardez votre progression ou restaurez-la sur un autre appareil",
        downloadJsonBackup: "Télécharger la sauvegarde JSON",
        restoreJsonBackup: "Restaurer la sauvegarde JSON",
        downloadDataPackage: "Télécharger le pack complet (.zip)",
        dataPackageHint: "Rapports et sauvegarde réunis dans un seul fichier ZIP.",
        xlsxExported: "Rapport XLSX téléchargé.",
        odsExported: "Rapport ODS téléchargé.",
        csvExported: "Données CSV téléchargées.",
        jsonBackupExported: "Sauvegarde JSON téléchargée.",
        dataPackageExported: "Paquet ZIP de données téléchargé.",
        restoreConfirm: "Restaurer {count} sessions et remplacer les données locales actuelles ?",
        backupRestored: "Sauvegarde des données restaurée."

    }
};

// ============================================================================
// Locale helpers
// ============================================================================

export function getLocale(lang) {
    if (lang === "ENG") return "en-US";
    if (lang === "FR") return "fr-FR";
    return "pl-PL";
}

export function t(lang, key) {
    return dictionaries[lang]?.[key] ?? dictionaries.ENG[key] ?? key;
}

// ============================================================================
// Apply translations to the DOM
// ============================================================================

export function applyTranslations(lang = "PL") {
    document.documentElement.lang =
        lang === "PL" ? "pl" : lang === "FR" ? "fr" : "en";

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        const value = t(lang, key);

        if (value) {
            element.textContent = value;
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        const value = t(lang, key);

        if (value) {
            element.placeholder = value;
        }
    });
}
