# Tech Elixir Solution Center

A **SharePoint Framework (SPFx) React web part** that acts as a living documentation and application engineering dashboard for SharePoint-based app builds.

It supports multiple internal applications — **Finance Elixir**, **Fitness Elixir**, **Script Elixir**, and other Tech Elixir projects — and surfaces the following information for each:

| Feature | Description |
|---|---|
| 📋 **App Overview** | Name, description, status badge, owner, and tags |
| 📊 **Documentation Completeness** | Visual progress bar (0–100 %) |
| 🏗️ **Architecture Documents** | Links to design documents with descriptions and last-updated dates |
| 📝 **Release Notes** | Collapsible version history with change lists |
| 🐙 **GitHub Repository Links** | Repo URL plus quick links to Issues, PRs, Projects, Actions |
| ⚡ **Power Platform Components** | Table of Power Apps, Power Automate flows, Dataverse tables, Connectors |
| 🔧 **Technical Debt** | Severity-tagged debt items with status tracking |
| ♿ **Accessibility Review** | WCAG-mapped checklist with Pass / Fail / Needs Review statuses |
| 🔒 **Security & Documentation Status** | Threat model, data classification, security review, and PIA statuses |
| 🔗 **Quick Links** | Icon-button grid of key documentation file links |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | [SPFx 1.18.2](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/whats-new-sharepoint-framework) |
| UI | React 17, TypeScript 4.7, [Fluent UI v8](https://developer.microsoft.com/en-us/fluentui#/) |
| Data | [PnPjs v3](https://pnp.github.io/pnpjs/) (SharePoint REST), mock data fallback |
| Build | Gulp, `@microsoft/sp-build-web` |
| Tests | Jest + ts-jest |

---

## Project Structure

```
Tech-Elixir-Solution-Center/
├── config/
│   ├── config.json                  # Bundle entry configuration
│   ├── package-solution.json        # Solution manifest
│   ├── serve.json                   # Local workbench config
│   └── write-manifests.json
├── sharepoint/assets/
│   └── elements.xml                 # SharePoint list provisioning XML
├── src/
│   └── webparts/techElixirSolutionCenter/
│       ├── TechElixirSolutionCenterWebPart.ts       # Web part class
│       ├── TechElixirSolutionCenterWebPart.manifest.json
│       ├── components/
│       │   ├── TechElixirSolutionCenter.tsx         # Root component
│       │   ├── ITechElixirSolutionCenterProps.ts
│       │   ├── TechElixirSolutionCenter.module.scss
│       │   ├── AppOverviewCard/
│       │   ├── DocCompletenessBar/
│       │   ├── ArchitectureDocs/
│       │   ├── ReleaseNotes/
│       │   ├── GitHubLinks/
│       │   ├── PowerPlatformRefs/
│       │   ├── TechnicalDebt/
│       │   ├── AccessibilityReview/
│       │   ├── SecurityStatus/
│       │   └── QuickLinks/
│       ├── data/
│       │   └── mockApps.ts          # Built-in seed data (4 apps)
│       ├── loc/
│       │   ├── en-us.js             # English strings
│       │   └── mystrings.d.ts
│       ├── models/
│       │   ├── IApplication.ts      # TypeScript interfaces
│       │   └── index.ts
│       ├── services/
│       │   └── AppDataService.ts    # PnPjs data service
│       └── tests/
│           └── TechElixirSolutionCenter.test.ts
├── package.json
├── tsconfig.json
├── gulpfile.js
└── jest.config.js
```

---

## Prerequisites

- Node.js 16.x or 18.x
- npm 8+
- SharePoint Online (for deployment)
- Gulp CLI: `npm install -g gulp-cli`

---

## Setup & Development

### 1. Install dependencies

```bash
npm install
```

### 2. Trust the development certificate (first time only)

```bash
npx gulp trust-dev-cert
```

### 3. Configure the workbench URL

Edit `config/serve.json` and replace the `initialPage` with your SharePoint tenant URL:

```json
{
  "initialPage": "https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE/_layouts/workbench.aspx"
}
```

### 4. Start the local development server

```bash
npx gulp serve
```

The web part loads with **built-in mock data** by default. No SharePoint list is required during development.

---

## Running Tests

```bash
npm test
```

Tests cover:
- Mock data integrity (all 4 apps have valid structure)
- `AppDataService` in mock-data mode (getApplications, getApplicationById, searchApplications)

---

## Building for Production

```bash
npx gulp bundle --ship
npx gulp package-solution --ship
```

The `.sppkg` package is written to `sharepoint/solution/tech-elixir-solution-center.sppkg`.

---

## Deploying to SharePoint

1. Upload `sharepoint/solution/tech-elixir-solution-center.sppkg` to the **SharePoint App Catalog**.
2. Click **Deploy** and choose whether to make it available tenant-wide.
3. Add the **Tech Elixir Solution Center** web part to any modern SharePoint page.

---

## SharePoint List Schema

The web part can optionally pull app records from a SharePoint list.  
The `sharepoint/assets/elements.xml` file provisions the **TechElixirApps** list automatically when the solution feature is activated.

### List: `TechElixirApps`

| Column | Internal Name | Type | Description |
|---|---|---|---|
| Title | `Title` | Text | Application name |
| Description | `Description` | Multi-line Text | Short app description |
| App Status | `AppStatus` | Choice | Active, InDevelopment, Deprecated, Planned |
| App Owner | `AppOwner` | Text | Owning team or person |
| Doc Completeness (%) | `DocCompleteness` | Number (0–100) | Overall documentation completion percentage |
| GitHub Repository URL | `GithubRepoUrl` | URL | Link to the GitHub repository |
| Tags | `Tags` | Text | Semicolon-separated tags (e.g. `Finance;SharePoint;Power BI`) |

> **Note:** Complex fields (architecture docs, release notes, Power Platform components, technical debt, accessibility items, security status, quick links) are stored within `AppDataService` or in external documents. They are not mapped to separate list columns in the initial release.

---

## Property Pane Configuration

| Setting | Description |
|---|---|
| **SharePoint List Name** | Name of the `TechElixirApps` list. Leave empty to use built-in mock data. |
| **Display Mode** | `Cards` (tabbed per-app detail view) or `List` (all apps in a single scrollable page) |
| **Filter by Application** | Optional text filter — shows only apps whose name matches the entered string |

---

## Adding a New Application

1. **Mock data** — Add a new `IApplication` object to `src/webparts/techElixirSolutionCenter/data/mockApps.ts`.
2. **SharePoint list** — Add a new item to the `TechElixirApps` list. The web part will pick it up on the next page load.

---

## Incremental Roadmap

- [ ] Full SharePoint list mapping for all `IApplication` fields (architecture docs, release notes, etc.)
- [ ] Editable mode — allow authorized users to update fields directly from the web part
- [ ] Viva Connections Adaptive Card Extension (ACE) summary card
- [ ] Power BI embedded report panel
- [ ] Export dashboard as PDF
- [ ] Automated accessibility scan integration (axe-core)

---

## Contributing

1. Fork or clone the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add/update tests
4. Run `npm test` and `npx gulp bundle` to verify
5. Open a pull request

---

## License

This project is licensed under the MIT License.
