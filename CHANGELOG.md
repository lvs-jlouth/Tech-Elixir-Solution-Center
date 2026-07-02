# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] – 2026-07-02

### Added

- Initial release of the Tech Elixir Solution Center SPFx web part
- **Solution Dashboard** – tabbed per-solution detail view (Cards mode) and scrollable list view (List mode)
- **App Overview** – name, description, status badge, owner, and tags per solution
- **Documentation Completeness** – visual progress bar (0–100 %)
- **Architecture Documents** – linked design documents with asset-type icons, descriptions, and last-updated dates
- **Release Timeline** – collapsible version history with change lists and deployment status badges
- **GitHub Repository Links** – repository URL plus quick links to Issues, Pull Requests, Projects, and Actions
- **Power Platform Components** – inventory table of Power Apps, Power Automate flows, Dataverse tables, and Connectors
- **Technical Debt Register** – severity-tagged items (Critical / High / Medium / Low) with status tracking
- **Accessibility Dashboard** – WCAG 2.1-mapped checklist with Pass / NeedsAttention / Blocked / NotReviewed statuses
- **Integration Inventory** – upstream/downstream integration records per solution
- **Document Matrix** – structured document catalogue with type, status, owner, and last-updated date
- **Quick Links** – icon-button grid linking to key documentation and resource files
- **Mock Data mode** – built-in seed data for four sample solutions; no SharePoint lists required
- **SharePoint Lists mode** – reads from seven provisioned SharePoint lists (Solution Registry, Solution Documents, Solution Releases, Solution Technical Debt, Solution Architecture Assets, Solution Integrations, Solution Accessibility Checks)
- **PowerShell provisioning script** (`scripts/Provision-TechElixirLists.ps1`) – idempotent list/column creation with `-SeedSampleData` switch
- **Sample data import script** (`scripts/Import-TechElixirSampleData.ps1`) – loads full JSON seed dataset from `sharepoint/seed-data`
- Property pane: list name, display mode, app filter, and per-section visibility toggles
- Full project documentation in `docs/` (overview, architecture, schema, installation, configuration, accessibility, development, release process, roadmap, manual test plan, enhancement backlog)
- `RELEASE_NOTES.md` with feature descriptions and known limitations
- `CHANGELOG.md` (this file)

### Build fixes (pre-release)

- Fixed `gulpfile.js`: renamed `build.addSuppressRule` → `build.addSuppression` to match `@microsoft/sp-build-web` 1.18.2 API
- Added missing `localizedResources` entry to `config/config.json` for `TechElixirSolutionCenterWebPartStrings`
- Added `eslint-plugin-react-hooks` and `@types/webpack-env` to dev dependencies
- Added `es2015.core` to `tsconfig.json` lib (required for `String.prototype.startsWith`)
- Excluded test files from main `tsconfig.json` compilation (test files are compiled under `tsconfig.test.json`)
- Added missing CSS module classes (`sectionTitle`, `sectionMeta`, `mutedText`, `notesText`) to `DocumentMatrix.module.scss` and its type stub
- Fixed type mismatch in `architectureAssets.ts` (`isImageArchitectureAssetType` index check)
- Fixed ESLint violations: removed unused imports, resolved inferrable-type annotations, escaped JSX entity
- Suppressed expected `package-solution` informational warning in `gulpfile.js`

---

<!-- Links -->
[1.0.0]: https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/releases/tag/v1.0.0
