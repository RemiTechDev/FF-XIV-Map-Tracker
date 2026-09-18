// ============================================================================
// Dependencies
// ============================================================================
import { MAPS_DATABASE, getMapById } from "../mapsData.js";
import {
    aggregateByDate,
    aggregateByLevel,
    aggregateByMap,
    calculateTotals,
    sessionProfit
} from "../calculations.js";
import { APP_VERSION } from "../storage.js";
import { datedBaseName, downloadBlob } from "./download.js";

// ============================================================================
// Workbook theme
// ============================================================================
const COLORS = {
    bg: "0F151F",
    bg2: "171F2D",
    gold: "D7A45B",
    goldLight: "F1BC6D",
    text: "E9EEF6",
    muted: "9AA7B9",
    green: "6FC49A",
    red: "DB7979",
    blue: "7396C9",
    white: "FFFFFF"
};

const GIL_FORMAT = '#,##0" Gil"';
const PERCENT_FORMAT = "0.0%";

// ============================================================================
// Workbook styling helpers
// ============================================================================
function ensureExcelJs() {
    if (!window.ExcelJS) {
        throw new Error("ExcelJS is not loaded.");
    }
}

function styleSheet(sheet) {
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.properties.defaultRowHeight = 19;
}

function styleHeaderRow(row) {
    row.height = 24;

    // ExcelJS exposes row.eachCell() as the supported way to iterate cells.
    // Using row.cells is unreliable because it is not a public iterable API.
    row.eachCell({ includeEmpty: true }, cell => {
        cell.font = {
            bold: true,
            color: { argb: COLORS.text },
            size: 10
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLORS.bg2 }
        };

        cell.alignment = {
            vertical: "middle"
        };

        cell.border = {
            bottom: {
                style: "thin",
                color: { argb: "3A4658" }
            }
        };
    });
}

function setTableStyle(sheet, headerRow = 1) {
    styleHeaderRow(sheet.getRow(headerRow));

    sheet.autoFilter = {
        from: { row: headerRow, column: 1 },
        to: { row: headerRow, column: Math.max(1, sheet.columnCount) }
    };

    for (let rowNumber = headerRow + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
        const row = sheet.getRow(rowNumber);

        // Alternate row background improves readability in large exports.
        if (rowNumber % 2 === 0) {
            row.eachCell(cell => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "F4F6F9" }
                };
            });
        }

        row.eachCell(cell => {
            cell.alignment = {
                vertical: "middle"
            };

            cell.border = {
                bottom: {
                    style: "hair",
                    color: { argb: "E0E5EC" }
                }
            };
        });
    }
}

function addTitle(sheet, title, subtitle = "") {
    sheet.mergeCells("A1:H2");

    const titleCell = sheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = {
        bold: true,
        size: 22,
        color: { argb: COLORS.goldLight }
    };
    titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.bg }
    };
    titleCell.alignment = {
        vertical: "middle",
        horizontal: "left"
    };

    if (!subtitle) {
        return;
    }

    sheet.mergeCells("A3:H3");

    const subtitleCell = sheet.getCell("A3");
    subtitleCell.value = subtitle;
    subtitleCell.font = {
        italic: true,
        size: 10,
        color: { argb: COLORS.muted }
    };
    subtitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.bg }
    };
    subtitleCell.alignment = {
        vertical: "middle"
    };
}

function addKpi(sheet, range, label, value, format = "#,##0") {
    sheet.mergeCells(range);

    const topLeftCell = range.split(":")[0];
    const cell = sheet.getCell(topLeftCell);

    cell.value = `${label}\n${typeof value === "number" ? value : String(value)}`;
    cell.font = {
        bold: true,
        size: 12,
        color: { argb: COLORS.text }
    };
    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.bg2 }
    };
    cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true
    };
    cell.border = {
        top: { style: "thin", color: { argb: COLORS.gold } },
        bottom: { style: "thin", color: { argb: COLORS.gold } },
        left: { style: "thin", color: { argb: COLORS.gold } },
        right: { style: "thin", color: { argb: COLORS.gold } }
    };

    if (typeof value === "number") {
        cell.numFmt = format;
    }
}

function applyNumberFormat(sheet, columnNumbers, format) {
    for (const columnNumber of columnNumbers) {
        sheet.getColumn(columnNumber).numFmt = format;
    }
}

// ============================================================================
// Chart.js → PNG helper
// ============================================================================
async function renderChartPng(config, width = 900, height = 400) {
    if (!window.Chart) {
        return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.fillStyle = "#0f151f";
    context.fillRect(0, 0, width, height);

    const chart = new window.Chart(context, {
        ...config,
        options: {
            ...config.options,
            responsive: false,
            animation: false,
            devicePixelRatio: 1,
            plugins: {
                ...(config.options?.plugins ?? {}),
                legend: {
                    labels: {
                        color: "#e9eef6"
                    }
                }
            },
            scales: config.options?.scales ?? {
                x: {
                    ticks: { color: "#9aa7b9" },
                    grid: { color: "rgba(255,255,255,.06)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#9aa7b9" },
                    grid: { color: "rgba(255,255,255,.06)" }
                }
            }
        }
    });

    chart.update("none");
    await new Promise(resolve => requestAnimationFrame(resolve));

    const base64 = canvas.toDataURL("image/png");
    chart.destroy();

    return base64;
}

// ============================================================================
// Dashboard chart placement
// ============================================================================
async function addDashboardCharts(workbook, sheet, sessions) {
    const levels = aggregateByLevel(sessions)
        .filter(row => row.maps > 0 || row.portals > 0);

    const dates = aggregateByDate(sessions);

    const maps = aggregateByMap(sessions)
        .filter(row => row.maps > 0 || row.earnedGil > 0 || row.spentGil > 0);

    const chartConfigs = [
        {
            anchor: {
                tl: { col: 0, row: 8 },
                ext: { width: 650, height: 320 }
            },
            config: {
                type: "bar",
                data: {
                    labels: levels.map(row => `Lv.${row.level}`),
                    datasets: [
                        {
                            label: "Maps",
                            data: levels.map(row => row.maps),
                            backgroundColor: `#${COLORS.gold}`
                        },
                        {
                            label: "Portals",
                            data: levels.map(row => row.portals),
                            backgroundColor: `#${COLORS.blue}`
                        }
                    ]
                }
            }
        },
        {
            anchor: {
                tl: { col: 5, row: 8 },
                ext: { width: 650, height: 320 }
            },
            config: {
                type: "line",
                data: {
                    labels: dates.map(row => row.date),
                    datasets: [
                        {
                            label: "Earned",
                            data: dates.map(row => row.earnedGil),
                            borderColor: `#${COLORS.green}`,
                            backgroundColor: `#${COLORS.green}`,
                            tension: 0.25
                        },
                        {
                            label: "Spent",
                            data: dates.map(row => row.spentGil),
                            borderColor: `#${COLORS.red}`,
                            backgroundColor: `#${COLORS.red}`,
                            tension: 0.25
                        },
                        {
                            label: "Profit",
                            data: dates.map(row => row.profitGil),
                            borderColor: `#${COLORS.goldLight}`,
                            backgroundColor: `#${COLORS.goldLight}`,
                            tension: 0.25
                        }
                    ]
                }
            }
        },
        {
            anchor: {
                tl: { col: 0, row: 25 },
                ext: { width: 1300, height: 370 }
            },
            config: {
                type: "bar",
                data: {
                    labels: maps.map(row => row.name),
                    datasets: [
                        {
                            label: "Profit (Gil)",
                            data: maps.map(row => row.profitGil),
                            backgroundColor: `#${COLORS.gold}`
                        }
                    ]
                },
                options: {
                    indexAxis: "y",
                    scales: {
                        x: {
                            ticks: { color: "#9aa7b9" },
                            grid: { color: "rgba(255,255,255,.06)" }
                        },
                        y: {
                            ticks: { color: "#9aa7b9" },
                            grid: { display: false }
                        }
                    }
                }
            }
        }
    ];

    for (const { config, anchor } of chartConfigs) {
        const base64 = await renderChartPng(config);

        if (!base64) {
            continue;
        }

        const imageId = workbook.addImage({
            base64,
            extension: "png"
        });

        sheet.addImage(imageId, anchor);
    }
}

// ============================================================================
// Worksheet builders
// ============================================================================
function addDashboardSheet(workbook, appData, totals) {
    const dashboard = workbook.addWorksheet("Dashboard", {
        views: [{ showGridLines: false }]
    });

    dashboard.columns = Array.from({ length: 12 }, (_, index) => ({
        key: `c${index}`,
        width: 15
    }));

    addTitle(
        dashboard,
        "FFXIV MAP TRACKER",
        `Report generated ${new Date().toLocaleString()} · v${APP_VERSION}`
    );

    addKpi(dashboard, "A5:B7", "TOTAL MAPS", totals.totalMaps);
    addKpi(dashboard, "C5:D7", "PORTAL RATE", `${totals.portalRate.toFixed(1)}%`);
    addKpi(dashboard, "E5:F7", "DUNGEON CLEARS", totals.totalClears);
    addKpi(dashboard, "G5:H7", "GIL EARNED", totals.earnedGil);
    addKpi(dashboard, "I5:J7", "GIL SPENT", totals.spentGil);
    addKpi(dashboard, "K5:L7", "NET PROFIT", totals.profitGil);

    for (let row = 1; row <= 46; row += 1) {
        dashboard.getRow(row).height = 20;
    }

    return dashboard;
}

function addSessionsSheet(workbook, sessionsData) {
    const sheet = workbook.addWorksheet("Sessions");
    styleSheet(sheet);

    sheet.columns = [
        { header: "Date", key: "date", width: 16 },
        { header: "Map", key: "map", width: 30 },
        { header: "Level", key: "level", width: 10 },
        { header: "Type", key: "type", width: 11 },
        { header: "Maps", key: "maps", width: 9 },
        { header: "Portals", key: "portals", width: 10 },
        { header: "Clears", key: "clears", width: 9 },
        { header: "Gil Earned", key: "earned", width: 16 },
        { header: "Gil Spent", key: "spent", width: 16 },
        { header: "Net Profit", key: "profit", width: 16 },
        { header: "Note", key: "note", width: 38 },
        { header: "Source", key: "source", width: 13 }
    ];

    for (const session of sessionsData) {
        const map = getMapById(session.mapId);

        sheet.addRow({
            date: session.date ?? "Legacy / unknown",
            map: map?.name ?? session.mapId,
            level: map?.level ?? "",
            type: map?.type ?? "",
            maps: session.maps,
            portals: session.portals,
            clears: session.clears,
            earned: session.earnedGil,
            spent: session.spentGil,
            profit: sessionProfit(session),
            note: session.note ?? "",
            source: session.source ?? "manual"
        });
    }

    applyNumberFormat(sheet, [8, 9, 10], GIL_FORMAT);
    setTableStyle(sheet);
}

function addMapsSheet(workbook, mapRows) {
    const sheet = workbook.addWorksheet("Maps");
    styleSheet(sheet);

    sheet.columns = [
        { header: "Map", key: "name", width: 30 },
        { header: "Level", key: "level", width: 9 },
        { header: "Type", key: "type", width: 11 },
        { header: "Portal Eligible", key: "eligible", width: 16 },
        { header: "Dungeon", key: "dungeon", width: 28 },
        { header: "Maps", key: "maps", width: 9 },
        { header: "Portals", key: "portals", width: 10 },
        { header: "Portal Rate", key: "portalRate", width: 14 },
        { header: "Clears", key: "clears", width: 9 },
        { header: "Gil Earned", key: "earned", width: 16 },
        { header: "Gil Spent", key: "spent", width: 16 },
        { header: "Net Profit", key: "profit", width: 16 },
        { header: "Avg Profit / Map", key: "avgProfit", width: 18 }
    ];

    for (const row of mapRows) {
        sheet.addRow({
            name: row.name,
            level: row.level,
            type: row.type,
            eligible: row.portalEligible ? "Yes" : "No",
            dungeon: row.dungeon ?? "",
            maps: row.maps,
            portals: row.portals,
            portalRate: row.portalRate / 100,
            clears: row.clears,
            earned: row.earnedGil,
            spent: row.spentGil,
            profit: row.profitGil,
            avgProfit: row.avgProfitPerMap
        });
    }

    applyNumberFormat(sheet, [8], PERCENT_FORMAT);
    applyNumberFormat(sheet, [10, 11, 12, 13], GIL_FORMAT);
    setTableStyle(sheet);
}

function addLevelsSheet(workbook, levelRows) {
    const sheet = workbook.addWorksheet("Levels");
    styleSheet(sheet);

    sheet.columns = [
        { header: "Level", key: "level", width: 10 },
        { header: "Maps", key: "maps", width: 10 },
        { header: "Portal Eligible Maps", key: "eligible", width: 20 },
        { header: "Portals", key: "portals", width: 10 },
        { header: "Portal Rate", key: "portalRate", width: 14 },
        { header: "Clears", key: "clears", width: 10 },
        { header: "Clear Rate", key: "clearRate", width: 13 },
        { header: "Gil Earned", key: "earned", width: 16 },
        { header: "Gil Spent", key: "spent", width: 16 },
        { header: "Net Profit", key: "profit", width: 16 }
    ];

    for (const row of levelRows) {
        sheet.addRow({
            level: row.level,
            maps: row.maps,
            eligible: row.portalEligibleMaps,
            portals: row.portals,
            portalRate: row.portalRate / 100,
            clears: row.clears,
            clearRate: row.clearRate / 100,
            earned: row.earnedGil,
            spent: row.spentGil,
            profit: row.profitGil
        });
    }

    applyNumberFormat(sheet, [5, 7], PERCENT_FORMAT);
    applyNumberFormat(sheet, [8, 9, 10], GIL_FORMAT);
    setTableStyle(sheet);
}

function addFinancesSheet(workbook, dateRows) {
    const sheet = workbook.addWorksheet("Finances");
    styleSheet(sheet);

    sheet.columns = [
        { header: "Date", key: "date", width: 16 },
        { header: "Maps", key: "maps", width: 10 },
        { header: "Portals", key: "portals", width: 10 },
        { header: "Clears", key: "clears", width: 10 },
        { header: "Gil Earned", key: "earned", width: 18 },
        { header: "Gil Spent", key: "spent", width: 18 },
        { header: "Net Profit", key: "profit", width: 18 }
    ];

    for (const row of dateRows) {
        sheet.addRow({
            date: row.date,
            maps: row.maps,
            portals: row.portals,
            clears: row.clears,
            earned: row.earnedGil,
            spent: row.spentGil,
            profit: row.profitGil
        });
    }

    applyNumberFormat(sheet, [5, 6, 7], GIL_FORMAT);
    setTableStyle(sheet);
}

function addMapDatabaseSheet(workbook) {
    const sheet = workbook.addWorksheet("Map Database");
    styleSheet(sheet);

    sheet.columns = [
        { header: "ID", key: "id", width: 18 },
        { header: "Map", key: "name", width: 30 },
        { header: "Level", key: "level", width: 10 },
        { header: "Type", key: "type", width: 12 },
        { header: "Portal Eligible", key: "eligible", width: 17 },
        { header: "Dungeon", key: "dungeon", width: 30 }
    ];

    for (const map of MAPS_DATABASE) {
        sheet.addRow({
            id: map.id,
            name: map.name,
            level: map.level,
            type: map.type,
            eligible: map.portalEligible ? "Yes" : "No",
            dungeon: map.dungeon ?? ""
        });
    }

    setTableStyle(sheet);
}

function addInfoSheet(workbook) {
    const sheet = workbook.addWorksheet("Info", {
        views: [{ showGridLines: false }]
    });

    sheet.getColumn(1).width = 24;
    sheet.getColumn(2).width = 80;

    sheet.addRows([
        ["FFXIV Map Tracker", `v${APP_VERSION}`],
        ["Generated", new Date().toISOString()],
        ["Storage model", "Session-based, local-first"],
        ["Portal rate", "Portals / completed portal-eligible maps"],
        ["Clear rate", "Dungeon clears / opened portals"],
        ["Net profit", "Gil earned - map purchase cost"],
        [
            "Legacy V3",
            "Migrated aggregate records may have unknown dates and zero historical map cost " +
            "because V3 did not store those fields."
        ],
        ["Project", "https://github.com/RemiTechDev/FF-XIV-Map-Tracker"],
        [
            "Legal",
            "FINAL FANTASY XIV and related names, marks and assets are property of Square Enix Holdings Co., Ltd. " +
            "This fan-made tracker is not affiliated with or endorsed by Square Enix."
        ]
    ]);

    sheet.getColumn(1).font = {
        bold: true,
        color: { argb: COLORS.gold }
    };

    sheet.eachRow(row => {
        row.getCell(2).alignment = {
            wrapText: true,
            vertical: "top"
        };
    });
}

// ============================================================================
// XLSX workbook creation
// ============================================================================
export async function createExcelBlob(appData) {
    ensureExcelJs();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "FFXIV Map Tracker by RemiTech";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.title = "FFXIV Map Tracker Report";

    const totals = calculateTotals(appData.sessions);
    const mapRows = aggregateByMap(appData.sessions);
    const levelRows = aggregateByLevel(appData.sessions);
    const dateRows = aggregateByDate(appData.sessions);

    const dashboard = addDashboardSheet(workbook, appData, totals);
    addSessionsSheet(workbook, appData.sessions);
    addMapsSheet(workbook, mapRows);
    addLevelsSheet(workbook, levelRows);
    addFinancesSheet(workbook, dateRows);
    addMapDatabaseSheet(workbook);
    addInfoSheet(workbook);

    await addDashboardCharts(workbook, dashboard, appData.sessions);

    const buffer = await workbook.xlsx.writeBuffer();

    return new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
}

// ============================================================================
// Browser download
// ============================================================================
export async function exportExcel(appData) {
    const blob = await createExcelBlob(appData);
    downloadBlob(blob, `${datedBaseName()}_report.xlsx`);
}
