# Tech Elixir Solution Center – Release Process

This document describes how to version, build, package, and deploy a new release of the Tech Elixir Solution Center web part.

---

## Versioning

The project follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

| Change type | Version bump | Example |
|---|---|---|
| Breaking change, major redesign | MAJOR | `1.x.x` → `2.0.0` |
| New feature, backward-compatible | MINOR | `1.0.x` → `1.1.0` |
| Bug fix, accessibility fix, doc update | PATCH | `1.0.0` → `1.0.1` |

---

## Version Files to Update

Before tagging a release, update version numbers in the following files:

| File | Field | Example |
|---|---|---|
| `package.json` | `"version"` | `"1.1.0"` |
| `config/package-solution.json` | `solution.version` | `"1.1.0.0"` (four-part) |

The `.sppkg` version in `package-solution.json` must be in four-part format (`MAJOR.MINOR.PATCH.BUILD`). Use `0` for the build number (e.g. `1.1.0.0`).

---

## Release Checklist

### 1. Pre-release

- [ ] All feature branches merged to `main` / default branch
- [ ] `npm test` passes with no failures
- [ ] `npx gulp bundle --ship` completes without errors
- [ ] Version numbers updated in `package.json` and `config/package-solution.json`
- [ ] `CHANGELOG` / release notes drafted (see below)
- [ ] Property pane tested in local workbench
- [ ] Mock data mode and SharePoint Lists mode both verified
- [ ] Accessibility keyboard navigation spot-checked
- [ ] No secrets or tenant-specific URLs in source

### 2. Build

```bash
npx gulp bundle --ship
npx gulp package-solution --ship
```

Output: `sharepoint/solution/tech-elixir-solution-center.sppkg`

### 3. Test in staging

Deploy the `.sppkg` to a **staging or developer site** App Catalog first:

1. Upload `tech-elixir-solution-center.sppkg` to the staging App Catalog.
2. Deploy and add the web part to a test page.
3. Toggle between mock data and SharePoint Lists mode and verify all sections render correctly.
4. Test on both light and dark SharePoint themes.

### 4. Deploy to production App Catalog

1. Upload the `.sppkg` to the production **App Catalog** (`Apps for SharePoint` library).
2. In the deployment dialog, click **Replace** if upgrading an existing version.
3. Click **Deploy**.
4. Pages hosting the web part will automatically receive the updated bundle on their next load (CDN cache may add a short delay).

### 5. Tag the release

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

Create a GitHub Release from the tag with:
- Release title: `v1.1.0`
- Release notes (see format below)
- Attach the `.sppkg` file as a release asset

---

## Release Notes Format

```markdown
## v1.1.0 – 2026-07-15

### What's new
- Added `IntegrationInventory` component to display upstream/downstream integrations per solution
- Added `SeedSampleData` switch to PowerShell provisioning script

### Improvements
- Improved keyboard navigation in the `SolutionDashboard` solution list
- Improved loading state accessibility with `aria-live` regions

### Bug fixes
- Fixed doc completeness bar not rendering when value is 0

### Documentation changes
- Added docs/03-installation-guide.md
- Updated docs/02-sharepoint-backend-schema.md with Solution Integrations schema

### Deployment notes
- No list schema changes required for this release
- No property pane migration needed
```

---

## Rollback

If a production release causes issues:

1. Upload the previous `.sppkg` to the App Catalog and deploy it.
2. The older bundle is served immediately on the next page load.
3. If the previous release is not available locally, retrieve it from the corresponding GitHub Release assets.

---

## Dependency Updates

When updating npm dependencies (including `@microsoft/sp-*` packages):

1. Review the [SPFx release notes](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/release-notes/) for breaking changes.
2. Update `package.json` and run `npm install`.
3. Run the full test and build pipeline before packaging.
4. Update `config/package-solution.json` `solution.version` as appropriate.

---

## CI / CD (Future)

A GitHub Actions workflow is planned to automate:
- Running `npm test` on every pull request
- Running `gulp bundle --ship` and `gulp package-solution --ship` on merge to `main`
- Attaching the `.sppkg` as a workflow artifact

See [docs/08-roadmap.md](08-roadmap.md) for the planned GitHub integration roadmap.
