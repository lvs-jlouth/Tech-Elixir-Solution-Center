---
title: Tech Elixir Solution Center Administration and Usage SOP
description: Standard operating procedure for administering, operating, and using the Tech Elixir Solution Center web part in SharePoint Online.
author: Tech Elixir Engineering
ms.date: 2026-07-02
ms.topic: how-to
keywords:
  - sharepoint
  - spfx
  - operations
  - sop
  - support
estimated_reading_time: 12
---

## Purpose

Use this SOP to run the Tech Elixir Solution Center in production with consistent administration, support, and user operations.

## Scope

This SOP applies to the SPFx package in [sharepoint/solution/tech-elixir-solution-center.sppkg](../sharepoint/solution/tech-elixir-solution-center.sppkg), the web part configuration model, and the optional SharePoint list backend.

## Reference Documents

* [docs/03-installation-guide.md](03-installation-guide.md)
* [docs/04-configuration-guide.md](04-configuration-guide.md)
* [docs/09-manual-test-plan.md](09-manual-test-plan.md)
* [docs/02-sharepoint-backend-schema.md](02-sharepoint-backend-schema.md)
* [RELEASE_NOTES.md](../RELEASE_NOTES.md)

## Roles and Responsibilities

| Role | Primary responsibilities |
|---|---|
| SharePoint Tenant Admin | Approves and deploys package to App Catalog, manages tenant availability |
| Site Owner | Adds web part to pages, configures property pane values for site use |
| Solution Administrator | Provisions lists, validates data mode, monitors operational health |
| Support Analyst | Executes triage, records incidents, validates user-reported issues |
| Release Manager | Coordinates upgrades, rollback decisions, and change communication |

## Service Modes

| Mode | When to use | Requirements |
|---|---|---|
| Mock Data mode | Demonstrations, early validation, temporary fallback during incidents | No backend lists |
| SharePoint Lists mode | Production data operations | Seven lists provisioned and accessible |

## Preconditions

Before daily operations or release events, confirm the following:

1. Package artifact is available and current.
2. Web part is deployed in App Catalog.
3. At least one target site page hosts the web part.
4. Expected data mode is documented for each environment.
5. Support contacts and escalation path are current.

## Administration SOP

### A. Access and Permissions

1. Confirm App Catalog deployment permissions are limited to approved admins.
2. Confirm target users have at least read access to hosting pages.
3. If running SharePoint Lists mode, confirm users have read access to all required lists.
4. Validate access quarterly or after role changes.

### B. Deployment and Upgrade Operations

1. Build and package the latest release.
2. For update events, use [scripts/Install-SolutionCenter.ps1](../scripts/Install-SolutionCenter.ps1) in `Upgrade` mode with non-destructive defaults.
3. Enable backup export before change execution for production updates.
4. Upload the package to App Catalog and deploy.
5. For updates, select Replace and deploy the new version.
6. Refresh target pages and run post-deploy checks in this SOP.
7. Record package version, deployment time, deployment owner, and backup artifact location.

> [!IMPORTANT]
> Keep a known good previous package version available for rollback.

### C. Backend List Operations

1. Provision lists with [scripts/Provision-TechElixirLists.ps1](../scripts/Provision-TechElixirLists.ps1) when SharePoint Lists mode is required.
2. When onboarding new sites, run [scripts/Install-SolutionCenter.ps1](../scripts/Install-SolutionCenter.ps1) with `CreateMissingSites` to create absent sites before provisioning.
3. Optionally seed sample data during provisioning for validation.
4. Optionally import structured sample data from [sharepoint/seed-data](../sharepoint/seed-data).
5. Confirm list names match property pane values exactly.
6. Re-run provisioning scripts after schema updates documented in release notes.

### D. Routine Health Checks

Perform this quick check schedule:

| Frequency | Check | Expected outcome |
|---|---|---|
| Daily | Open dashboard page and load one solution | No error state, expected sections visible |
| Weekly | Validate data mode and list connectivity | Correct mode active, no fetch failures |
| Weekly | Validate one non-admin user experience | User can open page and view expected data |
| Monthly | Review list naming, permissions, and stale data | No mismatches, no unauthorized access, no obvious data drift |
| Monthly | Review release notes for required operational actions | Run any required upgrade or migration steps |

### E. Incident Response

Use this triage sequence for service issues:

1. Identify whether the issue affects one user, one site, or all sites.
2. Confirm package deployment status in App Catalog.
3. Confirm web part property pane settings on affected page.
4. If in SharePoint Lists mode, confirm list existence, naming, and user access.
5. Test in Mock Data mode to isolate backend issues.
6. Log findings and escalate if unresolved.

> [!CAUTION]
> If production data mode fails and service visibility is required immediately, switch to Mock Data mode as a temporary mitigation and open an incident for backend restoration.

### F. Backup and Rollback

1. Keep prior known good package versions with version labels.
2. Before executing rollback automation, confirm `packagePath` in [config/solution-center.profile.rollback.dr.json](../config/solution-center.profile.rollback.dr.json) points to the approved known-good package.
3. On failed upgrade, re-upload previous package and deploy.
4. Validate dashboard load on at least one representative page.
5. Document rollback reason, timeline, and corrective action.

## Usage SOP

### A. Add the Web Part to a Page

1. Open a modern SharePoint page and select Edit.
2. Add a web part and search for Tech Elixir Solution Center.
3. Select the web part and place it on the page.
4. Publish the page.

### B. Configure the Web Part

1. Open the property pane.
2. Set Use Mock Data on or off based on environment intent.
3. If SharePoint Lists mode is selected, validate all list name fields.
4. Configure display settings such as GitHub links and compact mode.
5. Publish page changes.

### C. Daily User Workflow

1. Open the dashboard page.
2. Select a solution card.
3. Review overview, documentation completeness, release, and technical debt sections.
4. Use quick links to open supporting documentation.
5. Raise discrepancies to the support channel if data appears stale or inconsistent.

### D. Data Quality Workflow

1. Confirm the affected solution exists in Solution Registry.
2. Confirm related records exist in the corresponding supporting list.
3. Correct list data at source.
4. Refresh page and confirm updates are visible.
5. If still incorrect, follow incident response triage.

## Post-Deployment Validation Checklist

Run this checklist after every deployment or upgrade:

1. Web part appears in target site picker.
2. Page renders successfully without error state.
3. Expected data mode is active.
4. At least one solution detail panel opens correctly.
5. Feature toggles behave as configured.
6. Non-admin validation passes.
7. Results are recorded in change ticket or release notes.

## Escalation Matrix

| Priority | Example impact | Initial owner | Escalation target | Target response |
|---|---|---|---|---|
| P1 | Web part unavailable across multiple sites | Support Analyst | SharePoint Tenant Admin and Release Manager | 30 minutes |
| P2 | List mode unavailable, mock mode available | Solution Administrator | SharePoint Tenant Admin | 2 hours |
| P3 | Single site configuration issue | Site Owner | Solution Administrator | 1 business day |

## Change Log and Review Cadence

| Item | Cadence | Owner |
|---|---|---|
| SOP content review | Quarterly | Release Manager |
| Permissions review | Quarterly | SharePoint Tenant Admin |
| Data mode and list integrity review | Monthly | Solution Administrator |
| Deployment checklist refresh | Every release | Release Manager |

## Appendices

### Required List Names for SharePoint Lists Mode

| Setting | Default value |
|---|---|
| Solution Registry List | Solution Registry |
| Documents List | Solution Documents |
| Releases List | Solution Releases |
| Technical Debt List | Solution Technical Debt |
| Architecture Assets List | Solution Architecture Assets |
| Integrations List | Solution Integrations |
| Accessibility Checks List | Solution Accessibility Checks |

### Operational Command References

```powershell
nvm use 18.20.8
npm install
npm run clean
npm run ship
```

```powershell
.\scripts\Provision-TechElixirLists.ps1 -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/TechElixir"
```

```powershell
.\scripts\Import-TechElixirSampleData.ps1 -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/TechElixir" -SampleDataFolder ".\sharepoint\seed-data"
```

```powershell
.\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.install.template.json -NonInteractive
```

```powershell
.\scripts\Install-SolutionCenter.ps1 -OperationMode Upgrade -InstallScope SingleSite -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/TechElixir" -EnableBackup $true -BackupBeforeChanges $true -NonInteractive
```

```powershell
.\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.profile.upgrade.safe.json -NonInteractive
```

```powershell
.\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.profile.hub.full-rollout.json -NonInteractive
```

```powershell
.\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.profile.rollback.dr.json -NonInteractive
```