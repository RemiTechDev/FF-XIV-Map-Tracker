# Code Style

This project intentionally favors **readability over compactness**.

## General rules

- Use **4 spaces** for indentation.
- Keep one logical statement per line.
- Prefer descriptive names over abbreviations.
- Separate large files with visible section comments.
- Comments should explain **why** something exists or where a section begins; they should not narrate obvious syntax.
- Avoid minified or compressed source code in the repository.
- Keep business calculations outside DOM-rendering code whenever practical.

## Section comments

Large JavaScript files use separators such as:

```js
// ============================================================================
// Statistics rendering
// ============================================================================
```

CSS uses:

```css
/* ==========================================================================\n   Statistics charts\n   ========================================================================== */
```

HTML uses structural comments around the main views and larger UI sections.

## JavaScript

Prefer:

```js
if (!map.portalEligible) {
    elements.portals.value = "0";
    elements.clears.value = "0";
}
```

over:

```js
if (!map.portalEligible) { elements.portals.value = "0"; elements.clears.value = "0"; }
```

For configuration objects, keep important properties on separate lines:

```js
{
    label: "Profit",
    data: rows.map(row => row.profitGil),
    backgroundColor: colors.gold
}
```

## CSS

Every declaration should normally have its own line:

```css
.nav-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
}
```

Responsive rules live at the end of `styles.css` in the **Responsive layout** section.

## HTML

`index.html` is split into clearly marked areas:

- Sidebar
- Workspace / top bar
- Tracker
- Statistics
- Guide
- About
- Export & backup
- Global helpers

Inside larger views, additional comments identify KPI cards, forms, tables, charts, FAQ sections, and other major blocks.

## Translations

`js/i18n.js` uses one key per line and groups keys by feature:

- Branding & navigation
- Tracker summary
- Session form
- Map overview & history
- Statistics
- Guide & FAQ
- About
- Export & backup

Keep the same translation keys in Polish, English, and French.
