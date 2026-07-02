# Tech Elixir Solution Center – Manual Test Plan

This document is the manual test plan for the **TechElixirSolutionCenter** SharePoint Framework web part.  
Each section maps to a functional or non-functional area of the web part. Execute all checks in a modern SharePoint Online environment unless a specific note says otherwise.

Mark each item `[x]` when the expected result is confirmed, or record the observed behaviour and open a bug if the result differs.

---

## 1. Page Loads Successfully

- [ ] Navigate to a SharePoint modern page that contains the web part.
- [ ] The web part renders without a JavaScript error in the browser console.
- [ ] The web part title **"Tech Elixir Solution Center"** (or the configured custom title) is visible in the header.
- [ ] The subtitle **"Living documentation and engineering dashboard for SharePoint-based app builds"** is visible.
- [ ] Build metadata (version, data source indicator, user display name, site title) is displayed in the header.
- [ ] A loading skeleton is shown briefly while data is being fetched, then replaced by content.
- [ ] No unhandled promise rejections appear in the browser console after the page finishes loading.

---

## 2. Mock Data Mode

- [ ] Open the web part property pane and confirm **Use Mock Data** is toggled **On**.
- [ ] Save/apply the property pane.
- [ ] The build metadata banner shows **"Mock Data"** as the data source indicator.
- [ ] At least four solution cards are rendered (Finance Elixir, Fitness Elixir, Script Elixir, and one additional app).
- [ ] No network requests to SharePoint list REST endpoints are made (verify via browser DevTools Network tab).
- [ ] Each solution card shows a name, owner, status badge, health badge, version, environment, last-updated date, and doc-completeness bar.
- [ ] Selecting a solution card opens the detail panel without errors.
- [ ] All tabs in the detail panel (Overview, Documents, Releases, Architecture, Integrations, Technical Debt, Accessibility, Security) load content without errors.

---

## 3. SharePoint Data Mode

- [ ] Provision the seven SharePoint lists using `scripts/Provision-TechElixirLists.ps1` (or confirm they already exist).
- [ ] Add at least one item to the **Solution Registry** list with a valid **Title**, **Solution Status**, **Owner**, and **Doc Completeness** value.
- [ ] Open the property pane and toggle **Use Mock Data** to **Off (SharePoint Lists)**.
- [ ] Click **Apply** / **Publish**.
- [ ] The build metadata banner no longer shows "Mock Data".
- [ ] The solution card(s) matching the SharePoint list item(s) are displayed.
- [ ] Adding a second item to the **Solution Registry** list and refreshing the page shows the new solution in the grid.
- [ ] Changing a list item's **Solution Status** and refreshing the page reflects the updated status badge.
- [ ] If a list name is mis-typed in the property pane (e.g. extra space), the web part shows the error state and a **Retry** button.
- [ ] Correcting the list name and clicking **Retry** (or re-publishing) restores the solution grid.

---

## 4. No Data / Empty State

- [ ] In SharePoint data mode, ensure all lists are empty (no items in **Solution Registry**).
- [ ] The web part renders the **EmptyState** component instead of the solution grid.
- [ ] The empty-state message references the list names configured in the property pane.
- [ ] A link to the **Solution Registry** list on the current site is visible and navigates correctly.
- [ ] No JavaScript errors are thrown when the data set is empty.
- [ ] After adding one item to the list and refreshing, the empty state is replaced by the solution card.

---

## 5. Solution Card Rendering

- [ ] Each card displays: solution name, owner, status badge (with colour and text label), overall health badge, version, environment, last-updated date, and documentation-completeness progress bar.
- [ ] Status badge colour and text label are both present (not colour-only).
- [ ] Documentation completeness bar colour changes from red (< 50 %) → amber (50–79 %) → green (≥ 80 %).
- [ ] Tags (if present on the solution) are listed below the card body.
- [ ] Accessibility (`A11Y`) and Security compact health indicators appear when health-summary data is available.
- [ ] In **compact mode** (property pane toggle), card padding is visibly reduced and descriptions are truncated at 120 characters with an ellipsis.
- [ ] In **non-compact mode**, the full description is shown.
- [ ] Cards that have an `onSelect` handler display the solution name as an interactive button (not plain text).
- [ ] The `aria-label` on each card article element reads `"<Solution Name> application card"`.

---

## 6. Solution Detail Panel

- [ ] Click a solution card's name button to open the detail panel.
- [ ] The panel slides in from the right side of the screen.
- [ ] The panel header text matches the selected solution's name.
- [ ] A close button (×) is visible in the panel header.
- [ ] Pressing **Escape** closes the panel (light-dismiss).
- [ ] Clicking outside the panel closes it (light-dismiss).
- [ ] After the panel closes, keyboard focus returns to the element that opened it.
- [ ] While the panel is loading details, the **loading skeleton** is shown inside the Overview tab.
- [ ] Once loaded, the Overview tab shows: Description, Details (owner, status, environment, version, last-updated), Links, Health Indicators, and GitHub Metadata sections.
- [ ] Health indicators (Overall, Documentation, Accessibility, Security) display coloured icons and text labels.
- [ ] Quick links, GitHub repo link, and SharePoint site link (where present) are clickable and open in a new tab.
- [ ] Switching between tabs does not close the panel or lose the selected solution.

---

## 7. Documents Tab

- [ ] Open the detail panel and select the **Documents** tab.
- [ ] The documentation-completeness progress bar shows the correct percentage.
- [ ] The progress bar `aria-label` reads `"Documentation completeness: <N> percent"`.
- [ ] If any required documentation sections are missing, a red **"Missing required sections"** alert is displayed listing the section names.
- [ ] The **DocumentMatrix** table renders one row per documentation section with status indicators.
- [ ] If no documents exist for the solution, the progress bar shows 0 % and all sections are marked as missing.
- [ ] A load error in the documents tab shows the **ErrorState** component with a **Retry** button; clicking Retry re-fetches data.

---

## 8. Releases Tab

- [ ] Open the detail panel and select the **Releases** tab.
- [ ] The **ReleaseTimeline** component renders without errors.
- [ ] Release entries show version number, date, and description/notes.
- [ ] Entries are ordered chronologically (most-recent first or last — confirm consistent ordering).
- [ ] If the solution has no releases, a meaningful empty-state message is shown (no blank space).
- [ ] A loading skeleton is shown briefly while release data loads.

---

## 9. Architecture Tab

- [ ] Open the detail panel and select the **Architecture** tab.
- [ ] The **ArchitectureAssets** component renders without errors.
- [ ] Architecture diagram links/assets are listed with their titles and clickable URLs.
- [ ] If no architecture assets exist for the solution, a meaningful empty-state message is shown.
- [ ] A loading skeleton is shown briefly while architecture data loads.

---

## 10. Integrations Tab

- [ ] Open the detail panel and select the **Integrations** tab.
- [ ] The **IntegrationInventory** component renders without errors.
- [ ] Each integration record shows system name, direction (upstream/downstream), and description.
- [ ] If no integrations exist, the message **"No integrations registered for this application."** is displayed.
- [ ] A loading skeleton is shown briefly while integration data loads.
- [ ] A load error shows the **ErrorState** component with a **Retry** button.

---

## 11. Technical Debt Tab

- [ ] Open the detail panel and select the **Technical Debt** tab.
- [ ] The **TechnicalDebtRegister** component renders without errors.
- [ ] Debt items show title, severity, effort estimate, and status.
- [ ] If no debt items exist, a meaningful empty-state message is shown.
- [ ] A loading skeleton is shown briefly while data loads.

---

## 12. Accessibility Tab

- [ ] Open the detail panel and select the **Accessibility** tab (requires **Show Accessibility Dashboard** property pane setting to be **On**).
- [ ] The **AccessibilityDashboard** component renders without errors.
- [ ] Each accessibility check record shows: WCAG reference, status (Pass / NeedsAttention / Blocked / NotReviewed), impact area, remediation guidance, owner, and target date.
- [ ] Status values are shown with both a colour indicator and a text label.
- [ ] If no accessibility checks exist for the solution, a meaningful empty-state message is shown.
- [ ] A loading skeleton is shown briefly while data loads.
- [ ] With **Show Accessibility Dashboard** toggled **Off** in the property pane, the Accessibility tab is not present in the detail panel Pivot.

---

## 13. Filtering

- [ ] Type a partial solution name in the **Search solutions** text field; only matching cards remain visible.
- [ ] Type the owner name; only cards whose owner matches are shown.
- [ ] Clear the search field; all solutions reappear.
- [ ] Select a value from the **Environment** dropdown; only cards in that environment remain.
- [ ] Select a value from the **Status** dropdown; only cards with that status remain.
- [ ] Select a value from the **Health status** dropdown; only cards with matching overall health remain.
- [ ] Select a value from the **Accessibility status** dropdown; only matching cards remain.
- [ ] Select a value from the **App type** dropdown; only matching cards remain.
- [ ] Combine multiple filters simultaneously; the visible count reflects the intersection of all active filters.
- [ ] The `"N solutions visible"` status message updates in real time as filters change.
- [ ] The **Reset filters** button clears all filter controls and restores the full list.
- [ ] When no solution matches the active filters, the grid is empty but no error state is shown.

---

## 14. Sorting

- [ ] Open the **Sort by** dropdown and select **Title**; solution cards are sorted alphabetically A → Z.
- [ ] Select **Last updated**; cards are sorted by last-updated date (most recent first).
- [ ] Select **Health status**; cards are grouped/sorted by overall health status.
- [ ] Select **Documentation completeness**; cards are sorted by doc-completeness percentage (highest first).
- [ ] Select **Environment**; cards are sorted by derived environment label.
- [ ] Select **Current version**; cards are sorted by semantic version number.
- [ ] Select **Default**; cards return to the original load order.
- [ ] Sorting and filtering interact correctly (sort is applied to the filtered subset, not the full list).

---

## 15. Property Pane Settings

### General

- [ ] Change **Web Part Title** to a custom value; the header title updates immediately after clicking **Apply**.
- [ ] Clear the title field; the header falls back to **"Tech Elixir Solution Center"**.

### Data Source

- [ ] Toggle **Use Mock Data** On/Off; the data source switches without a page reload (on Apply).

### SharePoint List Names

- [ ] Each of the seven list name fields accepts a custom string.
- [ ] After entering a custom name matching an existing list and clicking Apply, the web part fetches from that list.

### Display Settings

- [ ] Set **Default Selected Solution** to an existing solution name; the detail panel for that solution opens automatically on page load.
- [ ] Clear **Default Selected Solution**; all solutions are shown without a pre-selection.
- [ ] Toggle **Show GitHub Links** Off; the GitHub Links section is hidden in the main solution view.
- [ ] Toggle **Show GitHub Links** On; the section reappears.
- [ ] Toggle **Show Power Platform Links** Off; the Power Platform section is hidden.
- [ ] Toggle **Show Power Platform Links** On; the section reappears.
- [ ] Toggle **Show Accessibility Dashboard** Off; the Accessibility tab in the detail panel is hidden.
- [ ] Toggle **Show Accessibility Dashboard** On; the tab reappears.
- [ ] Toggle **Compact Mode** On; card padding is reduced and descriptions are truncated.
- [ ] Toggle **Compact Mode** Off; cards return to full layout.

---

## 16. Theme Support

- [ ] Apply a **light** SharePoint theme to the page; the web part renders correctly with no clipped or invisible text.
- [ ] Apply a **dark** SharePoint theme to the page; the `isDarkTheme` prop is `true` and the `.darkTheme` CSS class is applied to the container.
- [ ] Status badge colours remain readable in both light and dark themes.
- [ ] Documentation-completeness bar colours (red/amber/green) remain distinguishable in both themes.
- [ ] Health indicator icons and labels remain visible in both themes.
- [ ] No hardcoded white or black backgrounds cause invisible elements under either theme.

---

## 17. Keyboard Navigation

- [ ] Press `Tab` from outside the web part; focus enters the web part at the first interactive element (search field or first card button).
- [ ] Press `Tab` repeatedly to advance through: search field → filter dropdowns → sort dropdown → Reset filters button → solution card buttons → Pivot tabs.
- [ ] Press `Shift+Tab` to move focus in reverse order without getting stuck.
- [ ] Press `Enter` or `Space` on a solution card button; the detail panel opens.
- [ ] Press `Escape` while the detail panel is open; the panel closes and focus returns to the card that opened it.
- [ ] Use `Arrow keys` to navigate within a Dropdown option list.
- [ ] Use `Arrow keys` to navigate between Pivot tab headers in the main dashboard and inside the detail panel.
- [ ] Press `Tab` inside the detail panel to reach and activate all links (GitHub, SharePoint, quick links).
- [ ] No keyboard trap exists anywhere in the web part (focus can always be moved out with `Tab` or `Escape`).

---

## 18. Screen Reader Labels

- [ ] Run NVDA (Windows/Chrome) or VoiceOver (macOS/Safari) and navigate to the web part.
- [ ] The filter section is announced as a landmark: `"Solution search and filters"`.
- [ ] The solution grid is announced as `"Solution applications"` (list landmark).
- [ ] Each card is announced with `"<Solution Name> application card"`.
- [ ] Each card's select button is announced as `"<Solution Name> — view details"`.
- [ ] Status badges read `"Status: <label>"` (not just the colour icon).
- [ ] Overall health badges read `"Overall health: <label>"`.
- [ ] The doc-completeness progress bar inside a card reads `"Documentation completeness: <N>%"`.
- [ ] The detail panel close button reads `"Close <Solution Name> detail panel"`.
- [ ] The detail panel Pivot group is announced as `"<Solution Name> detail sections"`.
- [ ] The `"N solutions visible"` count is announced via `aria-live="polite"` when filters change.
- [ ] Missing-sections alert in the Documents tab is announced immediately via `role="alert"`.
- [ ] Health indicators list inside the detail panel is announced as `"Health indicators"` (list landmark).

---

## 19. High Contrast Mode

- [ ] Enable Windows **High Contrast Black** mode (Settings → Ease of Access → High Contrast).
- [ ] Navigate to the SharePoint page with the web part.
- [ ] All text is legible against the high-contrast background.
- [ ] All interactive controls (buttons, dropdowns, links) have visible focus rings.
- [ ] Status badges show their text label (colour alone is not relied on).
- [ ] Health indicators show their icon and text label (colour alone is not relied on).
- [ ] The documentation-completeness bar is visible (border or outline present).
- [ ] The detail panel header, tab headers, and body content are all legible.
- [ ] Repeat the above checks in **High Contrast White** mode.

---

## 20. App Catalog Deployment

- [ ] Run `npx gulp bundle --ship && npx gulp package-solution --ship` and confirm the build exits with no errors.
- [ ] The file `sharepoint/solution/tech-elixir-solution-center.sppkg` is produced (or updated).
- [ ] Upload the `.sppkg` to the tenant App Catalog (**Apps for SharePoint** library).
- [ ] The deployment dialog appears; select **Deploy** (and optionally **Make this solution available to all sites**).
- [ ] Confirm the solution is listed in the App Catalog with status **Deployed**.
- [ ] Navigate to a **different** site collection, add a page, add the **Tech Elixir Solution Center** web part from the toolbox, and confirm it renders correctly in mock data mode.
- [ ] After a subsequent version update, upload the new `.sppkg` and click **Replace → Deploy**; the web part on existing pages reflects the new version in the build metadata without requiring a re-add.

---

## 21. Site Page Usage

- [ ] On a modern SharePoint site, create a new **Site Page**.
- [ ] In page edit mode, click **+** to add a web part, search for **Tech Elixir Solution Center**, and confirm it appears in the search results.
- [ ] Select the web part; it renders in mock data mode on the canvas.
- [ ] Click **Publish**; the page saves and the web part is visible to site visitors.
- [ ] Verify a site **visitor** (read-only permissions) can view the dashboard but cannot open the property pane.
- [ ] Open the web part property pane as a **site owner**, configure the title and data source, and confirm the settings persist after re-loading the page.
- [ ] Add the web part to a **section with a two-column layout**; verify the web part reflows to fit the column width without horizontal overflow.
- [ ] Add the web part to a **full-width section**; verify it stretches to fill the full page width.
- [ ] Remove the web part from the page and confirm no residual errors appear in the console.
