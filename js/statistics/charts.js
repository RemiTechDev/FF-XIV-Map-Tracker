// ============================================================================
// Dependencies
// ============================================================================
import {
    aggregateByDate,
    aggregateByLevel,
    aggregateByMap,
    formatNumber
} from "../calculations.js";

// ============================================================================
// Chart instance registry
// ============================================================================
const chartInstances = new Map();

// ============================================================================
// Theme helpers
// ============================================================================
function css(name, fallback) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback;
}

function palette() {
    return {
        gold: css("--gold", "#d7a45b"),
        goldStrong: css("--gold-strong", "#f1bc6d"),
        text: css("--text", "#e9eef6"),
        muted: css("--muted", "#8e9caf"),
        border: "rgba(255,255,255,.08)",
        blue: "#7396c9",
        green: "#6fc49a",
        red: "#db7979"
    };
}

// ============================================================================
// Shared Chart.js options
// ============================================================================
function baseOptions({ horizontal = false, percent = false } = {}) {
    const colors = palette();

    const horizontalScales = {
        x: {
            beginAtZero: true,
            max: percent ? 100 : undefined,
            ticks: {
                color: colors.muted,
                callback: value => (
                    percent ? `${value}%` : formatNumber(value, "en-US")
                )
            },
            grid: {
                color: colors.border
            }
        },
        y: {
            ticks: {
                color: colors.muted,
                autoSkip: false
            },
            grid: {
                display: false
            }
        }
    };

    const verticalScales = {
        x: {
            ticks: {
                color: colors.muted,
                maxRotation: 35,
                minRotation: 0
            },
            grid: {
                display: false
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                color: colors.muted,
                callback: value => formatNumber(value, "en-US")
            },
            grid: {
                color: colors.border
            }
        }
    };

    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 250
        },
        interaction: {
            mode: "index",
            intersect: false
        },
        plugins: {
            legend: {
                labels: {
                    color: colors.muted,
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                backgroundColor: "#101722",
                borderColor: "rgba(215,164,91,.28)",
                borderWidth: 1,
                titleColor: colors.text,
                bodyColor: colors.text,
                callbacks: percent
                    ? {
                        label: context => (
                            `${context.dataset.label ?? ""}: ${Number(context.raw).toFixed(1)}%`
                        )
                    }
                    : undefined
            }
        },
        scales: horizontal ? horizontalScales : verticalScales
    };
}

// ============================================================================
// Chart lifecycle
// ============================================================================
function renderChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);

    if (!canvas || typeof window.Chart === "undefined") {
        return;
    }

    const existing = chartInstances.get(canvasId);

    if (existing) {
        existing.destroy();
    }

    chartInstances.set(
        canvasId,
        new window.Chart(canvas, config)
    );
}

// ============================================================================
// Dataset builders
// ============================================================================
function financeDatasets(dates, colors) {
    return [
        {
            label: "Earned",
            data: dates.map(row => row.earnedGil),
            borderColor: colors.green,
            backgroundColor: colors.green,
            tension: 0.25,
            pointRadius: 2
        },
        {
            label: "Spent",
            data: dates.map(row => row.spentGil),
            borderColor: colors.red,
            backgroundColor: colors.red,
            tension: 0.25,
            pointRadius: 2
        },
        {
            label: "Profit",
            data: dates.map(row => row.profitGil),
            borderColor: colors.goldStrong,
            backgroundColor: colors.goldStrong,
            tension: 0.25,
            pointRadius: 2
        }
    ];
}

// ============================================================================
// Statistics chart definitions
// ============================================================================
export function renderStatisticsCharts(sessions = []) {
    const colors = palette();

    const levels = aggregateByLevel(sessions)
        .filter(row => row.maps > 0 || row.portals > 0);

    const dates = aggregateByDate(sessions);
    const maps = aggregateByMap(sessions);

    const activeMaps = maps.filter(
        row => row.maps > 0 || row.portals > 0 || row.earnedGil > 0 || row.spentGil > 0
    );

    const portalMaps = activeMaps.filter(
        row => row.portalEligible && row.maps > 0
    );

    // Maps and portals by level.
    renderChart("level-chart", {
        type: "bar",
        data: {
            labels: levels.map(row => `Lv. ${row.level}`),
            datasets: [
                {
                    label: "Maps",
                    data: levels.map(row => row.maps),
                    backgroundColor: colors.gold
                },
                {
                    label: "Portals",
                    data: levels.map(row => row.portals),
                    backgroundColor: colors.blue
                }
            ]
        },
        options: baseOptions()
    });

    // Earned, spent and net profit over time.
    renderChart("finance-chart", {
        type: "line",
        data: {
            labels: dates.map(row => row.date),
            datasets: financeDatasets(dates, colors)
        },
        options: baseOptions()
    });

    // Profit ranking by map.
    const profitRows = [...activeMaps]
        .sort((a, b) => b.profitGil - a.profitGil);

    renderChart("profit-chart", {
        type: "bar",
        data: {
            labels: profitRows.map(row => row.name),
            datasets: [
                {
                    label: "Profit (Gil)",
                    data: profitRows.map(row => row.profitGil),
                    backgroundColor: colors.gold
                }
            ]
        },
        options: {
            ...baseOptions({ horizontal: true }),
            indexAxis: "y"
        }
    });

    // Portal rate ranking only makes sense for portal-eligible maps.
    const portalRows = [...portalMaps]
        .sort((a, b) => b.portalRate - a.portalRate);

    renderChart("portal-chart", {
        type: "bar",
        data: {
            labels: portalRows.map(row => row.name),
            datasets: [
                {
                    label: "Portal rate",
                    data: portalRows.map(row => row.portalRate),
                    backgroundColor: colors.blue
                }
            ]
        },
        options: {
            ...baseOptions({ horizontal: true, percent: true }),
            indexAxis: "y"
        }
    });
}

// ============================================================================
// Public chart utilities
// ============================================================================
export function resizeStatisticsCharts() {
    requestAnimationFrame(() => {
        chartInstances.forEach(chart => chart.resize());
    });
}

export function destroyStatisticsCharts() {
    chartInstances.forEach(chart => chart.destroy());
    chartInstances.clear();
}
