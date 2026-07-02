# Release Notes – Tech Elixir Solution Center

---

## v1.0.0 – 2026-07-02

**Initial release** of the Tech Elixir Solution Center SharePoint Framework web part.

### What's new

- **Solution Dashboard** – tabbed per-solution detail view covering all major documentation and engineering concerns in a single web part
- **App Overview** – name, description, status badge (Active / In Development / Deprecated / Planned), owner, and tags for each solution
- **Documentation Completeness** – visual progress bar (0–100 %) derived from the `DocCompleteness` field
- **Architecture Documents** – linked design documents with descriptions and last-updated dates
- **Release Timeline** – collapsible version history with change lists and deployment status
- **GitHub Repository Links** – repository URL plus quick links to Issues, Pull Requests, Projects, and Actions
- **Power Platform Components** – inventory of Power Apps, Power Automate flows, Dataverse tables, and Connectors
- **Technical Debt Register** – severity-tagged debt items (Critical / High / Medium / Low) with status tracking and remediation guidance
- **Accessibility Dashboard** – WCAG 2.1-mapped checklist with Pass / NeedsAttention / Blocked / NotReviewed statuses
- **Integration Inventory** – upstream/downstream integration records per solution
- **Document Matrix** – structured document catalogue with type, status, and last-updated date per solution
- **Quick Links** – icon-button grid linking to key documentation and resource files
- **Mock Data mode (default)** – built-in seed data for four sample solutions (Finance Elixir, Fitness Elixir, Script Elixir, Script Elixir DevOps); no SharePoint lists required during development
- **SharePoint Lists mode** – reads from seven SharePoint lists provisioned in the target site:
  - Solution Registry
  - Solution Documents
  - Solution Releases
  - Solution Technical Debt
  - Solution Architecture Assets
  - Solution Integrations
  - Solution Accessibility Checks
- **PowerShell provisioning script** (`scripts/Provision-TechElixirLists.ps1`) – idempotent list and column creation with optional sample data seeding via `-SeedSampleData`
- **Sample data import script** (`scripts/Import-TechElixirSampleData.ps1`) – loads the full JSON seed dataset from `sharepoint/seed-data`
- **Property pane settings** – list name, display mode (Cards / List), app filter, and section visibility toggles

### Deployment notes

- `skipFeatureDeployment: true` – the solution can be deployed tenant-wide from the App Catalog without per-site activation
- `isDomainIsolated: false` – no isolated domain; runs in the standard SharePoint page domain
- No previous version; this is a first-time install

### Known limitations

See [Known Limitations](#known-limitations) below.

---

## Known Limitations

The following limitations are present in v1.0.0 and are tracked in the [roadmap](docs/08-roadmap.md):

| # | Area | Limitation | Planned fix |
|---|---|---|---|
| 1 | SharePoint Lists mode | Complex sub-entities (architecture docs, release notes, technical debt, accessibility checks, integrations) fall back to **mock data** even when a `listName` is configured. Only top-level solution fields are read from the `Solution Registry` list. | Full multi-list read is planned for a future MINOR release. |
| 2 | Accessibility | `aria-live` regions for loading and error states are **not consistently applied** across all components. | Audit and remediation planned. |
| 3 | Accessibility | Narrow-viewport table columns may require **horizontal scroll** (WCAG 1.4.10 Reflow). | Responsive stacked-column layout planned. |
| 4 | Accessibility | Modal/panel **focus trap and Escape key handling** have not been formally audited. | Dedicated keyboard audit planned. |
| 5 | Accessibility | **No automated accessibility scan** is integrated in the CI/test pipeline. | `jest-axe` / `@axe-core/react` integration planned. |
| 6 | GitHub links | GitHub metadata (open issues, PR count, last commit date, latest release) is **static mock data**; live GitHub API integration is not yet implemented. | Live GitHub REST/GraphQL integration planned. |
| 7 | Theming | Contrast ratios in **custom SharePoint themes** have not been fully verified against WCAG 1.4.3 requirements. | Per-theme contrast audit planned. |
| 8 | CI / CD | No **GitHub Actions workflow** exists; builds must be run manually. | CI workflow planned. |
| 9 | Editable mode | The dashboard is **read-only**; authorized users cannot update fields from within the web part. | Editable mode planned. |
| 10 | Export | No **PDF or CSV export** capability. | Export feature planned. |
