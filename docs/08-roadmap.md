# Tech Elixir Solution Center – Roadmap

This document captures planned features, integrations, and improvements for the Tech Elixir Solution Center web part.

Items are grouped by theme and ordered roughly by priority within each group. Nothing here is a committed delivery date — this is a living document.

---

## In Progress / Near Term

### Full SharePoint list mapping for all `IApplication` fields

**Status:** In progress  
Currently, only top-level fields (name, status, owner, doc completeness, GitHub URL, tags) are read from the `Solution Registry` list. Complex sub-entities (architecture docs, release notes, technical debt, accessibility checks, integrations) are currently sourced from mock data even in SharePoint Lists mode.

**Planned:** Read each sub-entity from its dedicated list (`Solution Documents`, `Solution Releases`, `Solution Technical Debt`, `Solution Architecture Assets`, `Solution Integrations`, `Solution Accessibility Checks`) and merge them into the `IApplication` model at runtime.

---

### Editable Mode

**Status:** Planned  
Allow authorized users (list editors) to update selected fields (status, doc completeness, owner) directly from within the web part without navigating to the SharePoint list.

**Approach:** Use the SPFx `DisplayMode` API to detect edit mode, swap display components for editable Fluent UI inputs, and write back via PnPjs on save.

---

### Automated Accessibility Scan Integration

**Status:** Planned  
Integrate [jest-axe](https://github.com/nickcolley/jest-axe) or `@axe-core/react` into the test suite to catch accessibility regressions automatically during development.

Additionally, evaluate integrating the [axe-core](https://github.com/dequelabs/axe-core) runtime scanner to surface accessibility issues in the Accessibility Dashboard.

---

## GitHub Integration

### GitHub Actions CI Workflow

**Status:** Planned  
Add a `.github/workflows/ci.yml` GitHub Actions workflow that runs on every push and pull request:

- `npm test` — unit tests
- `npx gulp bundle --ship` — verify the production build
- Upload the `.sppkg` as a workflow artifact on `main`

### Live GitHub Metadata

**Status:** Planned  
Extend the `GitHubLinks` and `GitHubMetadataSection` components to fetch live data from the GitHub REST API (or GitHub GraphQL API) using a GitHub Personal Access Token stored in SharePoint or Azure Key Vault:

- Open issues count
- Open pull requests count
- Last commit date
- Latest release tag

> Security consideration: The GitHub token must not be stored in web part properties or source code. A server-side Azure Function or SharePoint-hosted proxy will be required.

### GitHub Projects Integration

**Status:** Planned  
Surface the linked GitHub Projects board (sprint/kanban) for each solution within the dashboard using the GitHub REST API.

---

## Power Platform Integration

### Power Platform Component Live Status

**Status:** Planned  
Connect to the Power Platform admin API to show live status for Power Apps, Power Automate flows, and Dataverse tables listed in the `Solution Integrations` or `PowerPlatformRefs` sections:

- App published/unpublished status
- Flow enabled/disabled status
- Last run outcome for flows

### Power BI Embedded Report Panel

**Status:** Planned  
Embed a Power BI report panel within the solution detail view using the [Power BI Embedded](https://learn.microsoft.com/en-us/power-bi/developer/embedded/) SDK, allowing teams to view analytics reports without leaving the dashboard.

---

## Viva Connections

### Adaptive Card Extension (ACE)

**Status:** Planned  
Create a Viva Connections ACE that surfaces a summary card for each Tech Elixir solution, showing:

- Solution name and status
- Documentation completeness percentage
- Quick link to the full dashboard page

---

## Export and Reporting

### Export Dashboard as PDF

**Status:** Planned  
Add an export button that generates a formatted PDF of the current solution's detail view using a browser print API or a server-side rendering approach.

### Documentation Completeness Report

**Status:** Planned  
Generate a per-site documentation health report showing which solutions are below a configurable completeness threshold (e.g. below 70 %), exportable as a CSV or sent via Power Automate as an email.

---

## Performance and Operations

### Caching Layer

**Status:** Planned  
Add a client-side cache (using `sessionStorage` or PnPjs caching middleware) to reduce repeated SharePoint REST calls when the user navigates between solution tabs during a single page session.

### Telemetry Dashboard

**Status:** Planned  
Surface basic telemetry (most-viewed solutions, most-clicked links) using Application Insights, with opt-in controlled by a property pane toggle.

---

## Accessibility

### Full WCAG 2.1 AA Audit

**Status:** Planned  
Commission a formal accessibility audit against all components using both automated tools (axe-core) and manual screen reader testing (NVDA, JAWS, VoiceOver).

### Keyboard Navigation Improvements

**Status:** Planned  
Review and improve focus management across panel open/close interactions and collapsible release note sections to ensure WCAG 2.1.1 and 2.4.3 compliance.

---

## Documentation

### Interactive API Reference

**Status:** Planned  
Auto-generate an API reference for `IApplication` and related interfaces using TypeDoc.

### Video Walkthrough

**Status:** Planned  
Record a short video walkthrough of web part setup, list provisioning, and property pane configuration.

---

## Completed

| Feature | Release |
|---|---|
| Initial web part with mock data mode | v1.0.0 |
| SharePoint Lists mode (top-level fields) | v1.0.0 |
| PowerShell provisioning script (`Provision-TechElixirLists.ps1`) | v1.0.0 |
| Property pane with all data source and display settings | v1.0.0 |
| Accessibility Dashboard component | v1.0.0 |
| Integration Inventory component | v1.0.0 |
| Architecture Assets component | v1.0.0 |
| Technical Debt Register component | v1.0.0 |
| Release Timeline component | v1.0.0 |
| Document Matrix component | v1.0.0 |
| Full project documentation (docs/) | v1.0.0 |
