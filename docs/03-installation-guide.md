# Tech Elixir Solution Center – Installation Guide

This guide covers everything needed to build, package, provision SharePoint lists, and deploy the web part to SharePoint Online.

---

## Prerequisites

| Requirement | Version / Notes |
|---|---|
| Node.js | 16.x or 18.x (use `nvm` to manage versions) |
| npm | 8+ |
| Gulp CLI | `npm install -g gulp-cli` |
| SharePoint Online | Modern experience tenant |
| PowerShell (optional) | 7+ with [PnP.PowerShell](https://pnp.github.io/powershell/) for list provisioning |

---

## Step 1 – Install dependencies

Clone the repository and install npm packages:

```bash
git clone https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center.git
cd Tech-Elixir-Solution-Center
npm install
```

---

## Step 2 – Build and package the solution

### Development build (with source maps)

```bash
npx gulp bundle
npx gulp package-solution
```

### Production build (minified, no source maps)

```bash
npx gulp bundle --ship
npx gulp package-solution --ship
```

The `.sppkg` file is written to:

```
sharepoint/solution/tech-elixir-solution-center.sppkg
```

---

## Step 3 – Deploy to the SharePoint App Catalog

1. Open your SharePoint tenant and navigate to the **App Catalog** site  
   (e.g. `https://YOUR-TENANT.sharepoint.com/sites/appcatalog`).
2. Go to **Apps for SharePoint** in the left navigation.
3. Upload `sharepoint/solution/tech-elixir-solution-center.sppkg`.
4. In the deployment dialog:
   - Choose **Deploy** to make it globally available.
   - Optionally tick **Make this solution available to all sites** for tenant-wide deployment.
5. Click **Deploy**.

The solution is now available for site owners to add to pages.

---

## Step 4 – Provision SharePoint lists (optional)

The web part works with built-in mock data by default. If you want to store real data in SharePoint lists, provision the backend lists using one of the two methods below.

### Option A – Automatic via feature activation (legacy TechElixirApps list only)

The `sharepoint/assets/elements.xml` file provisions the legacy **TechElixirApps** list automatically when the solution feature is activated through the App Catalog. This creates a single simplified list covering top-level solution fields only.

### Option B – PowerShell provisioning script (full seven-list schema)

The `scripts/Provision-TechElixirLists.ps1` script creates all seven lists with the complete column set, indexes, and default views.

#### Prerequisites

```powershell
Install-Module PnP.PowerShell -Scope CurrentUser
```

#### Run without sample data

```powershell
.\scripts\Provision-TechElixirLists.ps1 -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/TechElixir"
```

#### Run with built-in sample item seeding

Add `-SeedSampleData` to insert one sample record in each list for immediate testing:

```powershell
.\scripts\Provision-TechElixirLists.ps1 -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/TechElixir" -SeedSampleData
```

The script is **idempotent** — safe to run multiple times. Existing lists and columns are left unchanged; only missing lists or columns are created.

#### Import the bundled JSON sample dataset

To load the full sample dataset from `sharepoint/seed-data`, run:

```powershell
.\scripts\Import-TechElixirSampleData.ps1 `
  -SiteUrl "https://YOUR-TENANT.sharepoint.com/sites/TechElixir" `
  -SampleDataFolder ".\sharepoint\seed-data"
```

This import is also **idempotent**. Matching records are updated instead of duplicated when the script is rerun.

#### What the script provisions

| List | Default name |
|---|---|
| Solution Registry | `Solution Registry` |
| Solution Documents | `Solution Documents` |
| Solution Releases | `Solution Releases` |
| Solution Technical Debt | `Solution Technical Debt` |
| Solution Architecture Assets | `Solution Architecture Assets` |
| Solution Integrations | `Solution Integrations` |
| Solution Accessibility Checks | `Solution Accessibility Checks` |

See [docs/02-sharepoint-backend-schema.md](02-sharepoint-backend-schema.md) for the full column definitions of each list.

---

## Step 5 – Add the web part to a SharePoint page

1. Navigate to a modern SharePoint page where you want the dashboard.
2. Click **Edit** (pencil icon).
3. Click **+** to add a web part.
4. Search for **Tech Elixir Solution Center** and select it.
5. Click **Publish** to save.

The web part loads in **mock data mode** by default. To switch to SharePoint Lists mode, configure the property pane — see [docs/04-configuration-guide.md](04-configuration-guide.md).

---

## Step 6 – Seeding sample data manually

If you did not use `-SeedSampleData` during provisioning, add an item to the **Solution Registry** list manually:

1. Open the **Solution Registry** list in your site.
2. Click **+ New**.
3. Fill in at minimum:
   - **Title**: e.g. `Finance Elixir`
   - **Solution Status**: `Active`
   - **Owner**: `Finance Team`
   - **Doc Completeness**: `78`
4. Click **Save**.
5. Note the `Id` of the new item.
6. Open each child list (Documents, Releases, etc.) and add corresponding items, setting `SolutionId` to the `Id` from step 5.

The web part picks up changes on the next page load.

---

## Upgrade

To update the web part after a new release:

1. Build and package the updated solution (Step 2).
2. Upload the new `.sppkg` to the App Catalog and click **Replace** → **Deploy**.
3. Refresh any page hosting the web part.

No list schema changes are required unless the release notes call for them.
