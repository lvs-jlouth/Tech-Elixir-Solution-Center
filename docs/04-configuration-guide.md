# Tech Elixir Solution Center – Configuration Guide

This guide describes every property pane setting exposed by the web part and how to configure the web part for your environment.

---

## Opening the Property Pane

1. Navigate to the SharePoint page containing the web part.
2. Click **Edit** (pencil icon) in the top-right.
3. Click the **Edit** icon (pencil) on the web part itself, or select the web part and click **Edit web part** in the toolbar.
4. The property pane opens on the right side of the page.

---

## Property Pane Groups

The property pane is divided into four groups.

---

### 1. General

| Setting | Label | Default | Description |
|---|---|---|---|
| `webPartTitle` | Web Part Title | `Tech Elixir Solution Center` | The title displayed at the top of the web part. |

---

### 2. Data Source

| Setting | Label | Default | Description |
|---|---|---|---|
| `useMockData` | Use Mock Data | `On` (Mock Data) | Toggle between built-in mock data and live SharePoint lists. |

**Toggle values:**
- **On (Mock Data):** The web part loads the four built-in sample applications (`Finance Elixir`, `Fitness Elixir`, `Script Elixir`, and a fourth app). No SharePoint lists are required.
- **Off (SharePoint Lists):** The web part reads data from the seven SharePoint lists configured in the **SharePoint List Names** group below. Lists must exist before toggling this off.

---

### 3. SharePoint List Names

These settings are only used when **Use Mock Data** is set to **Off**.

| Setting | Label | Default list name | Description |
|---|---|---|---|
| `solutionRegistryListName` | Solution Registry List | `Solution Registry` | Master list of solutions. |
| `documentsListName` | Documents List | `Solution Documents` | Documentation matrix records. |
| `releasesListName` | Releases List | `Solution Releases` | Release history and deployment status. |
| `technicalDebtListName` | Technical Debt List | `Solution Technical Debt` | Engineering debt backlog. |
| `architectureAssetsListName` | Architecture Assets List | `Solution Architecture Assets` | Architecture diagrams and design assets. |
| `integrationsListName` | Integrations List | `Solution Integrations` | Upstream/downstream system integrations. |
| `accessibilityChecksListName` | Accessibility Checks List | `Solution Accessibility Checks` | WCAG-mapped accessibility checks. |

> If you used the PowerShell provisioning script with default settings, these defaults match exactly and no changes are needed.
>
> If you renamed any list during provisioning, update the corresponding field to match.

---

### 4. Display Settings

| Setting | Label | Default | Description |
|---|---|---|---|
| `defaultSelectedSolution` | Default Selected Solution | *(empty)* | Name of the solution to pre-select when the page loads. Leave empty to show all solutions without a pre-selection. |
| `showGitHubLinks` | Show GitHub Links | `On` | Toggles the GitHub repository links section for each solution. |
| `showPowerPlatformLinks` | Show Power Platform Links | `On` | Toggles the Power Platform components section. |
| `showAccessibilityDashboard` | Show Accessibility Dashboard | `On` | Toggles the Accessibility Review / Dashboard section. |
| `compactMode` | Compact Mode | `Off` | When on, reduces padding and card sizes for smaller viewports or space-constrained pages. |

---

## Example: Switching from Mock Data to SharePoint Lists

1. Provision the lists using the PowerShell script (see [docs/03-installation-guide.md](03-installation-guide.md)).
2. Add at least one item to the **Solution Registry** list.
3. Open the web part property pane.
4. In **Data Source**, toggle **Use Mock Data** to **Off (SharePoint Lists)**.
5. Leave **SharePoint List Names** at their defaults (or adjust if you used custom names).
6. Click **Apply** and **Publish**.

The web part re-fetches data from the SharePoint lists on the next render. If the lists are empty or unreachable, it automatically falls back to mock data.

---

## Example: Pre-selecting a Solution

If you embed the web part on a solution-specific page (e.g. a Finance Elixir landing page), set **Default Selected Solution** to `Finance Elixir`. The detail panel for that solution opens immediately when the page loads.

---

## Example: Hiding Sections

On a page where GitHub integration has not yet been configured, toggle **Show GitHub Links** to **Off** to hide the empty section and reduce visual clutter.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Web part shows mock data even after toggling off | List names do not match | Check that list names in the property pane match the actual SharePoint list titles exactly (case-sensitive). |
| Web part shows an error state | List does not exist or permissions issue | Ensure the lists are provisioned and the current user has read access. |
| GitHub Links section not visible | `showGitHubLinks` is off | Toggle it on in Display Settings. |
| Solutions not filtered | `defaultSelectedSolution` is empty | Enter the exact solution name (case-sensitive). |
