---
title: Portable Installation and Anonymization Guide
description: Guide for deploying Solution Center in client environments with interactive or config-driven installation and anonymized sample data.
author: Tech Elixir Engineering
ms.date: 2026-07-03
ms.topic: how-to
keywords:
  - sharepoint
  - installer
  - anonymization
  - hub-sites
  - productization
estimated_reading_time: 10
---

## Purpose

Use this guide to deploy Solution Center in a portable and repeatable way for client environments.

## What Is Included

* Installer orchestrator: [scripts/Install-SolutionCenter.ps1](../scripts/Install-SolutionCenter.ps1)
* Seed-data anonymizer: [scripts/New-AnonymizedSeedData.ps1](../scripts/New-AnonymizedSeedData.ps1)
* Config template: [config/solution-center.install.template.json](../config/solution-center.install.template.json)
* Safe upgrade profile: [config/solution-center.profile.upgrade.safe.json](../config/solution-center.profile.upgrade.safe.json)
* Full hub rollout profile: [config/solution-center.profile.hub.full-rollout.json](../config/solution-center.profile.hub.full-rollout.json)
* Disaster recovery rollback profile: [config/solution-center.profile.rollback.dr.json](../config/solution-center.profile.rollback.dr.json)
* Provisioning script: [scripts/Provision-TechElixirLists.ps1](../scripts/Provision-TechElixirLists.ps1)
* Import script: [scripts/Import-TechElixirSampleData.ps1](../scripts/Import-TechElixirSampleData.ps1)

## Prerequisites

* PowerShell 7+
* PnP.PowerShell module
* SharePoint permissions to create lists and write data on target sites

Install PnP.PowerShell if needed:

```powershell
Install-Module PnP.PowerShell -Scope CurrentUser
```

## Installation Modes

### Interactive Mode

Runs prompts for scope and target URLs.

```powershell
.\scripts\Install-SolutionCenter.ps1
```

### Config-Driven Mode

Use a JSON file for repeatable client onboarding and pipeline execution.

```powershell
.\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.install.template.json -NonInteractive
```

### Ready-to-Run Profiles

Safe production upgrade profile:

```powershell
.\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.profile.upgrade.safe.json -NonInteractive
```

Full hub rollout profile:

```powershell
.\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.profile.hub.full-rollout.json -NonInteractive
```

Disaster recovery rollback profile:

```powershell
.\scripts\Install-SolutionCenter.ps1 -ConfigPath .\config\solution-center.profile.rollback.dr.json -NonInteractive
```

The rollback profile is package-focused and backup-first: it deploys a previous known-good package, keeps list mutation operations off, and captures pre-change backups for auditability.

Before a real rollback event, set `packagePath` in [config/solution-center.profile.rollback.dr.json](../config/solution-center.profile.rollback.dr.json) to the exact known-good `.sppkg` artifact for the target environment.

## Single-Site Install

Use when deploying to one client site collection.

```powershell
.\scripts\Install-SolutionCenter.ps1 `
  -InstallScope SingleSite `
  -SiteUrl "https://contoso.sharepoint.com/sites/SolutionCenter" `
  -ProvisionLists $true `
  -ImportSampleData $true `
  -SampleDataFolder ".\sharepoint\seed-data"
```

## Hub-Associated Site Rollout

Use when deploying infrastructure across multiple associated sites.

```powershell
.\scripts\Install-SolutionCenter.ps1 `
  -InstallScope HubSites `
  -HubSiteUrl "https://contoso.sharepoint.com/sites/Hub" `
  -AssociatedSiteUrls @(
    "https://contoso.sharepoint.com/sites/AppA",
    "https://contoso.sharepoint.com/sites/AppB"
  ) `
  -ProvisionLists $true `
  -ImportSampleData $false `
  -NonInteractive
```

### Hub Auto-Discovery

Use this to discover associated sites from the hub automatically. If you also provide `associatedSiteUrls`, the installer merges both sets and removes duplicates.

```powershell
.\scripts\Install-SolutionCenter.ps1 `
  -InstallScope HubSites `
  -HubSiteUrl "https://contoso.sharepoint.com/sites/Hub" `
  -DiscoverAssociatedSites $true `
  -ProvisionLists $true `
  -ImportSampleData $false `
  -NonInteractive
```

## App Catalog Package Deployment

Use this to upload and optionally publish the `.sppkg` package before list provisioning and data import.

```powershell
.\scripts\Install-SolutionCenter.ps1 `
  -InstallScope SingleSite `
  -SiteUrl "https://contoso.sharepoint.com/sites/SolutionCenter" `
  -DeployPackage $true `
  -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog" `
  -PackagePath ".\sharepoint\solution\tech-elixir-solution-center.sppkg" `
  -PublishPackage $true `
  -ProvisionLists $true `
  -ImportSampleData $true
```

## Non-Destructive Upgrade Mode

Use `Upgrade` mode for in-place updates. With `NonDestructiveUpgrade` enabled, the installer suppresses sample seeding and sample import by default.

```powershell
.\scripts\Install-SolutionCenter.ps1 `
  -OperationMode Upgrade `
  -InstallScope SingleSite `
  -SiteUrl "https://contoso.sharepoint.com/sites/SolutionCenter" `
  -DeployPackage $true `
  -AppCatalogUrl "https://contoso.sharepoint.com/sites/appcatalog" `
  -PackagePath ".\sharepoint\solution\tech-elixir-solution-center.sppkg" `
  -NonDestructiveUpgrade $true `
  -ProvisionLists $true `
  -NonInteractive
```

## Backup Service

Use backup export to snapshot target lists into JSON before or after change execution.

```powershell
.\scripts\Install-SolutionCenter.ps1 `
  -OperationMode Upgrade `
  -InstallScope HubSites `
  -HubSiteUrl "https://contoso.sharepoint.com/sites/Hub" `
  -DiscoverAssociatedSites $true `
  -EnableBackup $true `
  -BackupBeforeChanges $true `
  -BackupFolder ".\backups" `
  -NonInteractive
```

Backup output structure:

* `backups/backup-YYYYMMDD-HHMMSS/<site>/backup-manifest.json`
* `backups/backup-YYYYMMDD-HHMMSS/<site>/list-*.json`

## Missing Site Auto-Creation

Use this to check target URLs from tenant admin and create missing sites before provisioning.

```powershell
.\scripts\Install-SolutionCenter.ps1 `
  -InstallScope HubSites `
  -HubSiteUrl "https://contoso.sharepoint.com/sites/Hub" `
  -AssociatedSiteUrls @(
    "https://contoso.sharepoint.com/sites/AppA",
    "https://contoso.sharepoint.com/sites/AppB"
  ) `
  -CreateMissingSites $true `
  -TenantAdminUrl "https://contoso-admin.sharepoint.com" `
  -MissingSiteTemplate CommunicationSite `
  -AutoAssociateCreatedSitesToHub $true `
  -ProvisionLists $true `
  -ImportSampleData $false `
  -NonInteractive
```

Team site creation is also supported. For `TeamSite`, provide `-MissingSiteOwnerUpn` and use URLs compatible with `/sites/<alias>`.

## Anonymize Sample Data for Distribution

Use this before sharing sample data externally or packaging marketplace artifacts.

```powershell
.\scripts\New-AnonymizedSeedData.ps1
```

Optional custom org token:

```powershell
.\scripts\New-AnonymizedSeedData.ps1 -OrganizationName "Contoso"
```

Default output folder:

* [sharepoint/seed-data-anonymized](../sharepoint/seed-data-anonymized)

## Configuration Notes

Edit [config/solution-center.install.template.json](../config/solution-center.install.template.json) for client-specific rollout values.

Recommended fields to set per client:

* `operationMode`
* `installScope`
* `siteUrl` or `associatedSiteUrls`
* `hubSiteUrl` and `discoverAssociatedSites` (for hub rollout)
* `createMissingSites`, `tenantAdminUrl`, `missingSiteTemplate`, `missingSiteOwnerUpn`, `autoAssociateCreatedSitesToHub` (for missing-site automation)
* `nonDestructiveUpgrade`
* `enableBackup`, `backupBeforeChanges`, `backupFolder`, `backupListNames`
* `deployPackage`, `appCatalogUrl`, `packagePath`, `publishPackage` (for package automation)
* `importSampleData`
* `sampleDataFolder`
* `branding` block

## Operational Output

The installer generates a timestamped JSON report in repository root:

* `install-report-YYYYMMDD-HHMMSS.json`

Report rows include site creation status, backup status/path, package deployment status, and provisioning/import outcomes.

Use this report as evidence in change-control and deployment records.
