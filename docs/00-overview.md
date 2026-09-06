# Tech Elixir Solution Center – Overview

## What is it?

**Tech Elixir Solution Center** is a SharePoint Framework (SPFx) React web part that acts as a **living documentation and engineering dashboard** for SharePoint-based application builds. Instead of scattered wikis and spreadsheets, it consolidates everything teams need to understand, monitor, and maintain their solutions into a single, structured view embedded directly on a SharePoint page.

The web part tracks multiple internal applications under the **Tech Elixir** umbrella:

| Application | Description |
|---|---|
| Finance Elixir | Financial management, budget tracking, and reporting |
| Fitness Elixir | Employee wellness and fitness activity tracking |
| Script Elixir | Automation scripts and DevOps tooling hub |

---

## Features

| Feature | Description |
|---|---|
| 📋 **App Overview** | Name, description, status badge, owner, and tags per solution |
| 📊 **Documentation Completeness** | Visual progress bar (0–100 %) for each solution |
| 🏗️ **Architecture Documents** | Links to design documents with descriptions and last-updated dates |
| 📝 **Release Notes** | Collapsible version history with change lists and deployment status |
| 🐙 **GitHub Repository Links** | Repo URL plus quick links to Issues, PRs, Projects, and Actions |
| ⚡ **Power Platform Components** | Inventory of Power Apps, Power Automate flows, Dataverse tables, and Connectors |
| 🔧 **Technical Debt** | Severity-tagged debt items with status tracking and remediation guidance |
| ♿ **Accessibility Review** | WCAG-mapped checklist with Pass / NeedsAttention / Blocked / NotReviewed statuses |
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

## Data Modes

The web part operates in two modes:

- **Mock Data mode (default):** Loads built-in seed data for all four sample apps. No SharePoint lists required. Ideal for development and preview.
- **SharePoint Lists mode:** Reads from seven SharePoint lists provisioned in the target site. Full details are in [docs/02-sharepoint-backend-schema.md](02-sharepoint-backend-schema.md).

---

## Documentation Index

| Document | Description |
|---|---|
| [00-overview.md](00-overview.md) | This document |
| [01-architecture.md](01-architecture.md) | Component and data-flow architecture |
| [02-sharepoint-backend-schema.md](02-sharepoint-backend-schema.md) | SharePoint list schemas |
| [03-installation-guide.md](03-installation-guide.md) | Build, package, and deploy to SharePoint |
| [04-configuration-guide.md](04-configuration-guide.md) | Property pane settings |
| [05-accessibility-notes.md](05-accessibility-notes.md) | WCAG compliance and accessibility guidance |
| [06-development-guide.md](06-development-guide.md) | Local development and contributing |
| [07-release-process.md](07-release-process.md) | Release versioning and deployment checklist |
| [08-roadmap.md](08-roadmap.md) | Future features and planned integrations |
| [11-administration-and-usage-sop.md](11-administration-and-usage-sop.md) | Administration and usage operating procedure |
| [12-portable-installation-guide.md](12-portable-installation-guide.md) | Portable installer and anonymization guide |
