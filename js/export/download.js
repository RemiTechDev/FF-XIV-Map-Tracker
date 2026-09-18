// ============================================================================
// Shared download helpers
// ============================================================================
export function datedBaseName(prefix = "FFXIV_Map_Tracker") {
    return `${prefix}_${new Date().toISOString().slice(0, 10)}`;
}

export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
