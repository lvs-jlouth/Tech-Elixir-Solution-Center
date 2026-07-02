# Tech Elixir Solution Center – Future Enhancement Backlog

This document is the product backlog for the **TechElixirSolutionCenter** SPFx web part.  
Items are grouped by theme and ordered by priority within each group.

**Priority key:** P1 Critical · P2 High · P3 Medium · P4 Low  
**Complexity key:** XS (< 1 day) · S (1–2 days) · M (3–5 days) · L (1–2 weeks) · XL (> 2 weeks)

---

## 1. MVP Completion

These items close the gap between the current v1.0.0 release and a fully data-driven deployment.

---

### BL-001 · Full SharePoint List Mapping for All `IApplication` Sub-entities

**Description**  
The `SharePointDataService` currently reads only top-level solution fields from the **Solution Registry** list. All child entities (documents, releases, technical debt, architecture assets, integrations, accessibility checks) are served from mock data even when SharePoint Lists mode is active. Map every child list to its corresponding `IApplication` sub-type so that the web part is genuinely data-driven end-to-end.

**Value**  
Customers cannot use the web part as a live production dashboard without this. It is the single most important missing feature.

**Complexity** M

**Priority** P1

**Dependencies** None — all seven lists and their schemas are already defined.

---

### BL-002 · Editable Mode for Selected Fields

**Description**  
Detect when the page is in SharePoint edit mode (`DisplayMode.Edit` from SPFx) and swap selected read-only display fields (status, owner, doc completeness, target release) for Fluent UI inputs. On save, write updated values back to the relevant SharePoint list item using PnPjs `sp.web.lists.getByTitle(...).items.getById(...).update(...)`. Show a confirmation toast on success and revert on cancel.

**Value**  
Removes the need for users to navigate to the list to make routine data updates, reducing friction and increasing data accuracy.

**Complexity** M

**Priority** P2

**Dependencies** BL-001 (list mapping must be complete before write-back makes sense).

---

### BL-003 · Client-Side Caching Layer

**Description**  
Add a `sessionStorage`-backed caching middleware to the `SharePointDataService` and `MockDataService`. Cache responses keyed by list name + solution ID with a configurable TTL (default 5 minutes). On the first request within a session, store the result; on subsequent requests, return the cached value and optionally trigger a background re-fetch. Use PnPjs caching middleware where possible.

**Value**  
Reduces repeated REST calls during a single page session, improving perceived performance when users navigate between solutions and tabs.

**Complexity** S

**Priority** P2

**Dependencies** BL-001.

---

### BL-004 · GitHub Actions CI Workflow

**Description**  
Add `.github/workflows/ci.yml` to run on every push and pull request:
- `npm test` — unit test suite
- `npx gulp bundle --ship` — production build verification
- Upload the `.sppkg` artifact on pushes to `main`

**Value**  
Prevents regressions from reaching the main branch. Provides a downloadable `.sppkg` for every successful build without a local toolchain.

**Complexity** S

**Priority** P2

**Dependencies** None.

---

### BL-005 · Inline Error Recovery in Detail Panel

**Description**  
Currently, when the detail panel fails to load child data, the error is shown as a full-panel `ErrorState`. Improve recovery by: (a) displaying errors per tab rather than blocking the entire panel, (b) automatically retrying once after a 3-second delay, and (c) showing a dismissible warning banner if only non-critical data (e.g. GitHub metadata) fails.

**Value**  
Improves resilience and user experience when the SharePoint tenant is throttled or a single list is temporarily unreachable.

**Complexity** S

**Priority** P3

**Dependencies** BL-001.

---

### BL-006 · App Type Auto-Detection and Manual Override

**Description**  
Extend the `IApplication` model with a persisted `appType` column in the **Solution Registry** list (choices: SPFx Web Part, Power App, Power Automate, Teams App, Azure Function, Hybrid). The `getDerivedAppType` utility currently infers the type from metadata heuristics. Where the inferred value is wrong, allow an editor to override it via the new SharePoint column or the editable mode (BL-002). Surface the app type as a card badge.

**Value**  
Improves the App Type filter reliability and makes solution classification explicit.

**Complexity** S

**Priority** P3

**Dependencies** BL-001, BL-002 (optional).

---

## 2. GitHub Integration

---

### BL-010 · Live GitHub Repository Metadata via Secure Proxy

**Description**  
Fetch live data from the GitHub REST API for each solution's linked repository: open issue count, open PR count, last-commit date, default branch, latest release tag, and star count. Implement a lightweight Azure Function proxy that accepts a repository URL, exchanges it for a GitHub token stored in Azure Key Vault, and returns the metadata. The web part calls the proxy URL (configurable in the property pane) using the current user's SharePoint OAuth token for proxy authentication.

**Value**  
Surfaces real-time engineering health signals inside the dashboard without requiring users to navigate to GitHub.

**Complexity** L

**Priority** P2

**Dependencies** Azure Function resource in the customer's tenant; Azure Key Vault for token storage. BL-004 (CI workflow should validate the proxy contract).

---

### BL-011 · GitHub Actions Workflow Status Widget

**Description**  
Within the **Releases** tab and the main solution card, show the status of the most-recent GitHub Actions workflow run (success / failure / in-progress) as a coloured badge. Fetch data from the GitHub Actions REST API via the proxy introduced in BL-010. Clicking the badge opens the workflow run URL in a new tab.

**Value**  
Provides instant CI/CD feedback directly on the dashboard without context-switching to GitHub.

**Complexity** M

**Priority** P3

**Dependencies** BL-010.

---

### BL-012 · GitHub Projects Kanban Surface

**Description**  
Within the solution detail panel, add a **Sprint/Kanban** tab that surfaces the linked GitHub Projects board. Use the GitHub GraphQL API (via the BL-010 proxy) to retrieve open project items grouped by column (e.g. To Do / In Progress / Done). Render items as a read-only card list grouped by status column.

**Value**  
Closes the gap between engineering task tracking and the solution dashboard — product owners can see sprint status without leaving SharePoint.

**Complexity** L

**Priority** P3

**Dependencies** BL-010, BL-011.

---

### BL-013 · Automated Release Notes Generation from GitHub

**Description**  
When a new GitHub release is published, trigger an Azure Function (or Power Automate flow) via a GitHub webhook to write a new item into the **Solution Releases** SharePoint list automatically, populating version, date, summary, and changes from the GitHub release body. Map the GitHub release tag to the `Version` column and parse markdown change lists into the semicolon-delimited `Changes` format.

**Value**  
Eliminates the manual step of copying release notes from GitHub to SharePoint, keeping the dashboard in sync with source-of-truth release data.

**Complexity** M

**Priority** P3

**Dependencies** BL-001, BL-010 (proxy/Azure Function infrastructure).

---

### BL-014 · Dependabot / Security Advisory Feed

**Description**  
Fetch open Dependabot security alerts for each solution's repository (via the GitHub REST API security-advisories endpoint and the BL-010 proxy). Display a summary count (critical / high / medium / low) in the **Security** tab of the detail panel. Clicking a severity count opens the GitHub security tab in a new browser tab.

**Value**  
Surfaces dependency vulnerability data alongside the existing security status fields, giving security reviewers a single pane of glass.

**Complexity** M

**Priority** P3

**Dependencies** BL-010; GitHub Advanced Security or Dependabot must be enabled on each repository.

---

## 3. Power Platform Integration

---

### BL-020 · Power Platform Component Live Status

**Description**  
Connect to the Power Platform Admin API to retrieve the live status of each Power App, Power Automate flow, and Dataverse table listed in a solution's `powerPlatformComponents` array. Display published/unpublished, enabled/disabled, and last-run-outcome statuses as coloured badges next to each component. Use a Managed Identity–authenticated Azure Function as the backend proxy.

**Value**  
Gives Power Platform admins immediate visibility into component health without opening the Power Platform admin centre.

**Complexity** L

**Priority** P2

**Dependencies** Azure Function with Managed Identity; Power Platform admin permissions granted to the identity.

---

### BL-021 · Power BI Embedded Report Panel

**Description**  
Add a **Reports** tab to the solution detail panel that embeds a Power BI report using the Power BI Embedded JavaScript SDK. The report URL (workspace ID and report ID) is configurable per solution in the **Solution Registry** list as a new `PowerBIReportUrl` column. Authenticate using the current user's Microsoft identity token (user-owns-data embedding model).

**Value**  
Allows teams to view custom analytics reports for a solution directly in the dashboard without a separate Power BI workspace tab.

**Complexity** M

**Priority** P3

**Dependencies** Power BI Pro / Premium licences for users; `powerbi-client` npm package (check advisory database before adding).

---

### BL-022 · Power Automate Flow Trigger Buttons

**Description**  
Allow solution owners to register one or more Power Automate HTTP-triggered flows against a solution (stored as a new `automationFlows` column in the **Solution Registry** list). Render these as action buttons inside the solution detail panel. Clicking a button calls the flow's HTTP trigger URL, shows a spinner, and displays the outcome. Suitable for actions such as "Refresh data from source" or "Send weekly health report".

**Value**  
Extends the dashboard from read-only to interactive, enabling lightweight workflow automation without custom code.

**Complexity** M

**Priority** P4

**Dependencies** BL-001; Power Automate Premium licences if HTTP trigger connectors are required.

---

### BL-023 · Dataverse Table Row Count and Health

**Description**  
For solutions with Dataverse components, fetch the approximate row count and last-modified date for each registered Dataverse table using the Dataverse Web API. Surface these as metadata chips in the **Integrations** tab alongside the existing integration inventory.

**Value**  
Provides data volume and freshness signals for Dataverse-backed solutions without leaving the dashboard.

**Complexity** M

**Priority** P4

**Dependencies** BL-020 (Managed Identity proxy); Dataverse environment accessible from the Azure Function.

---

## 4. Copilot / AI Documentation Generation

---

### BL-030 · AI-Assisted Documentation Completeness Suggestions

**Description**  
Integrate with the Azure OpenAI Service (GPT-4o) to analyse the existing documentation sections for a solution and generate a plain-English improvement summary. When a solution's `docCompleteness` is below a configurable threshold (default 70 %), display a **"Suggest improvements"** button in the **Documents** tab. Clicking it calls an Azure Function that reads the existing document metadata, prompts the model, and returns a structured list of suggested sections and their recommended content outlines. Results are shown in a read-only panel — no automatic writing to SharePoint.

**Value**  
Reduces the cognitive load of documentation gap analysis and gives authors a concrete starting point, increasing documentation completeness across the portfolio.

**Complexity** L

**Priority** P3

**Dependencies** Azure OpenAI Service resource with GPT-4o deployment; Azure Function proxy (can reuse BL-010 infrastructure); BL-001 (documents must be read from SharePoint for the prompt to be meaningful).

---

### BL-031 · Automated Release Notes Summarisation

**Description**  
When a new `Solution Releases` item is added with a `Changes` field that contains raw bullet points (e.g. commit messages), provide a **"Summarise"** button in the Releases tab. Clicking it calls the Azure OpenAI proxy (BL-030) to generate a concise, plain-English release summary from the raw change list. The user can accept the suggestion (which writes back to the `Summary` column via PnPjs) or discard it.

**Value**  
Reduces the time required to produce readable release summaries from dense commit logs, improving the quality of the release history shown to stakeholders.

**Complexity** M

**Priority** P3

**Dependencies** BL-030; BL-001; BL-002 (editable mode for write-back).

---

### BL-032 · Technical Debt Remediation Suggestions

**Description**  
For open technical debt items with a blank or minimal `SuggestedRemediation` field, add a **"Get AI suggestion"** button in the Technical Debt tab. Clicking it sends the item title, category, severity, and impact description to the Azure OpenAI proxy (BL-030) and returns a structured remediation plan (recommended approach, estimated effort, risks). The user can save the suggestion to the list or discard it.

**Value**  
Accelerates debt triage and planning by providing engineer-level remediation guidance at a click, reducing the time technical leads spend on debt review.

**Complexity** M

**Priority** P4

**Dependencies** BL-030; BL-001; BL-002.

---

### BL-033 · Accessibility Remediation Guidance Generator

**Description**  
For accessibility check items with status `Blocked` or `NeedsAttention` that lack `RemediationGuidance`, add a **"Generate guidance"** button. The Azure OpenAI proxy (BL-030) receives the WCAG reference, impact area, and notes and returns step-by-step remediation guidance specific to SPFx and Fluent UI. The guidance is shown inline in the Accessibility tab and can optionally be saved back to the list.

**Value**  
Reduces the specialist knowledge required to remediate accessibility issues, enabling developers unfamiliar with WCAG to act on findings independently.

**Complexity** M

**Priority** P4

**Dependencies** BL-030; BL-001; BL-002.

---

## 5. SharePoint Provisioning Automation

---

### BL-040 · Idempotent Column and View Additions to Existing Scripts

**Description**  
The `Provision-TechElixirLists.ps1` script creates missing lists and columns but does not update default views to include newly added columns. When the schema is extended in a future release, users who re-run the script against an existing site will have the new columns but not the updated views. Add view management logic to the provisioning script so that default views are updated to include any columns added since the initial run.

**Value**  
Makes the provisioning script fully upgrade-safe, reducing post-upgrade list configuration work for administrators.

**Complexity** S

**Priority** P2

**Dependencies** None.

---

### BL-041 · PnP Provisioning Template (XML/JSON)

**Description**  
Create a PnP Provisioning Template (`.xml` or `.pnp`) that defines all seven lists, columns, views, content types, and the site page hosting the web part. The template can be applied via `Invoke-PnPSiteTemplate` as a single-command site setup, replacing the multi-step PowerShell + manual page creation process.

**Value**  
Reduces the time to provision a new Tech Elixir site from 30+ minutes of manual steps to a single command, improving adoption in new environments.

**Complexity** M

**Priority** P2

**Dependencies** BL-040 (columns and views should be finalised before templating).

---

### BL-042 · Site Design / Site Script Integration

**Description**  
Wrap the PnP template (BL-041) in a SharePoint Site Design and associated Site Scripts so that site owners can apply the full Tech Elixir configuration from the **Apply a site template** UI without PowerShell. Register the site design at tenant level via the tenant App Catalog deployment step.

**Value**  
Removes the PowerShell prerequisite for non-technical administrators, enabling self-service provisioning.

**Complexity** M

**Priority** P3

**Dependencies** BL-041.

---

### BL-043 · Automated Sample Data Import via GitHub Actions

**Description**  
Add a GitHub Actions workflow that runs `Import-TechElixirSampleData.ps1` against a designated demo site when changes to `sharepoint/seed-data/*.json` are merged to `main`. Use a GitHub Actions secret for the SharePoint service account credentials (or certificate-based Managed Identity).

**Value**  
Keeps the demo/test environment in sync with the seed data automatically, removing a manual step from the release process.

**Complexity** S

**Priority** P3

**Dependencies** BL-004; a SharePoint service account or app registration with write permissions on the demo site.

---

### BL-044 · Tenant-Wide Deployment Health Check Script

**Description**  
Create a PowerShell script (`scripts/Test-TechElixirDeployment.ps1`) that validates a target site: checks that all seven lists exist, verifies required columns are present, confirms the web part is installed on the site's App Catalog, and outputs a pass/fail report. Integrate this as a step in the GitHub Actions CI workflow (BL-004) running against the demo site.

**Value**  
Provides a fast, automated post-deployment validation step that catches provisioning drift early.

**Complexity** S

**Priority** P3

**Dependencies** BL-004; BL-040.

---

## 6. Accessibility Improvements

---

### BL-050 · Integrate `jest-axe` into the Test Suite

**Description**  
Add `jest-axe` as a development dependency and write axe-core accessibility snapshot tests for every component in `src/webparts/techElixirSolutionCenter/components/`. Run the tests as part of `npm test` and fail the CI build (BL-004) on any new axe violation. Suppress pre-existing known violations with documented inline comments until they are resolved.

**Value**  
Catches accessibility regressions automatically during development, preventing issues from reaching production.

**Complexity** S

**Priority** P1

**Dependencies** BL-004 (CI integration); `jest-axe` npm package (check advisory database before adding).

---

### BL-051 · `aria-live` Region Audit and Remediation

**Description**  
Audit all loading states, filter result count updates, and error state transitions for missing `aria-live` regions. The `"N solutions visible"` counter already uses `aria-live="polite"` but loading spinners and error banners do not consistently announce themselves. Add `aria-live="polite"` to `LoadingSkeleton` and `ErrorState` wrapper elements. Add `aria-live="assertive"` to the missing-sections alert in the Documents tab.

**Value**  
Resolves WCAG 4.1.3 (Status Messages) gap identified in `docs/05-accessibility-notes.md`, ensuring screen reader users are notified of state changes without needing to re-query the page.

**Complexity** XS

**Priority** P1

**Dependencies** None.

---

### BL-052 · Focus Management Audit for Panel Open/Close

**Description**  
Conduct a formal keyboard audit of all panel and modal interactions. Verify that: (a) focus moves into the panel on open, (b) focus is trapped within the panel while open (Tab and Shift+Tab cycle only within the panel), (c) Escape closes the panel, and (d) focus returns to the triggering element on close. Fix any gaps found. Document the expected focus sequence for each interaction in `docs/05-accessibility-notes.md`.

**Value**  
Resolves the WCAG 2.1.2 (No Keyboard Trap) gap identified in `docs/05-accessibility-notes.md`.

**Complexity** S

**Priority** P2

**Dependencies** None.

---

### BL-053 · Responsive Column Hiding for Narrow Viewports

**Description**  
At breakpoints below 480 px, hide lower-priority columns in the `DocumentMatrix` and `IntegrationInventory` tables (e.g. Owner, Last Updated) and stack them below the primary content. Add a "Show all columns" toggle for users on wide-enough viewports who need the full data. Verify that the tables reflow correctly at 320 CSS pixels wide to meet WCAG 1.4.10 (Reflow).

**Value**  
Removes the need for horizontal scroll on mobile and narrow SharePoint column layouts, resolving the WCAG 1.4.10 gap in `docs/05-accessibility-notes.md`.

**Complexity** M

**Priority** P2

**Dependencies** None.

---

### BL-054 · Formal WCAG 2.1 AA Audit with External Tooling

**Description**  
Commission (or conduct internally) a formal accessibility audit using NVDA + Chrome, JAWS + Edge, and VoiceOver + Safari against the full web part feature set. Log findings as items in the **Solution Accessibility Checks** list. For each finding, create a corresponding GitHub issue and link it from the accessibility check record. Track resolution in subsequent releases.

**Value**  
Provides an auditable record of WCAG 2.1 AA compliance, required for public sector deployments and Microsoft 365 accessibility commitments.

**Complexity** L

**Priority** P2

**Dependencies** BL-051, BL-052, BL-053 (known gaps should be resolved before the formal audit).

---

### BL-055 · Motion Reduction Support

**Description**  
Wrap any CSS transitions and animations (loading skeleton pulse, card hover effects, panel slide) in `@media (prefers-reduced-motion: reduce)` queries. Where animations are disabled by this preference, substitute instant state changes. Test with Windows "Show animations in Windows" setting turned off.

**Value**  
Supports users with vestibular disorders, aligning with WCAG 2.3 (Seizures and Physical Reactions) best practice.

**Complexity** XS

**Priority** P3

**Dependencies** None.

---

## 7. Security and Compliance

---

### BL-060 · Column-Level Permission Support

**Description**  
Extend the web part to respect SharePoint column-level permissions on sensitive fields (e.g. `DataClassification` in the Integrations list). If the current user's token does not include access to a restricted column, omit that field from the rendered UI rather than showing an error. Detect permission errors (HTTP 403 on individual column selects) and gracefully degrade.

**Value**  
Prevents accidental exposure of restricted metadata to users who should not see it, supporting least-privilege data access.

**Complexity** M

**Priority** P2

**Dependencies** BL-001.

---

### BL-061 · Content Security Policy (CSP) Compliance Review

**Description**  
Audit all external URLs opened by the web part (GitHub links, architecture doc links, Power BI embeds, Azure Function calls) against the tenant's SharePoint Online Content Security Policy. Replace any `innerHTML` usages or dynamic `eval`-equivalent patterns (none known currently, but verify after BL-010 and BL-021) with CSP-safe alternatives. Document the external origins the web part requires and include guidance in `docs/03-installation-guide.md`.

**Value**  
Required for tenants that enforce a strict CSP, particularly in regulated industries (financial services, government).

**Complexity** S

**Priority** P2

**Dependencies** BL-010 (adds external Azure Function origin), BL-021 (adds Power BI origin).

---

### BL-062 · Privacy Impact Assessment (PIA) Data Minimisation

**Description**  
Audit what user data the web part reads from `pageContext` (currently: `user.displayName`, `web.title`, `web.absoluteUrl`). Confirm that no personally identifiable information (PII) beyond display name is stored in `sessionStorage` cache entries (BL-003) or sent to Azure Functions (BL-010). Add a **Privacy Notice** section to `docs/00-overview.md` documenting every PII field processed.

**Value**  
Required for GDPR compliance and satisfies tenant information governance requirements.

**Complexity** S

**Priority** P2

**Dependencies** BL-003; BL-010.

---

### BL-063 · Threat Model Document for GitHub Proxy

**Description**  
Produce a formal threat model (STRIDE) for the Azure Function proxy introduced in BL-010, covering: token exposure, replay attacks, over-permissioned app registrations, and denial-of-service via rate-limit exhaustion. Attach the threat model as a linked architecture asset in the **Solution Architecture Assets** list for the Tech Elixir Solution Center solution itself.

**Value**  
Supports security review sign-off for tenants with formal change-advisory processes.

**Complexity** M

**Priority** P3

**Dependencies** BL-010.

---

### BL-064 · Automated Secret Scanning in CI

**Description**  
Add a `gitleaks` or `trufflesecurity/trufflehog` GitHub Actions step to the CI workflow (BL-004) that scans every push for accidentally committed secrets (API keys, tokens, connection strings). Fail the build on any detection. Add a `.gitleaks.toml` allowlist for mock data patterns that resemble keys.

**Value**  
Prevents accidental secret exposure in the repository, a common attack vector for SPFx solutions that sometimes embed SharePoint connection strings in property bags.

**Complexity** XS

**Priority** P2

**Dependencies** BL-004.

---

## 8. Reporting and Analytics

---

### BL-070 · Documentation Completeness Portfolio Report

**Description**  
Add an **Export** button to the main dashboard toolbar that generates a CSV containing one row per solution with columns: Solution Name, Owner, Status, Doc Completeness %, Missing Sections, Last Updated. Trigger a browser file download using the `Blob` API. Optionally add a Power Automate flow trigger (BL-022) to email the report on a schedule.

**Value**  
Allows programme managers to track portfolio-wide documentation health in external tools (Excel, Power BI) without manual data entry.

**Complexity** S

**Priority** P2

**Dependencies** BL-001.

---

### BL-071 · Technical Debt Heat Map

**Description**  
Add a **Heat Map** view to the Technical Debt tab (accessible via a view-toggle button) that renders a matrix of categories (Architecture, Security, Accessibility, etc.) vs. severity (Critical, High, Medium, Low) with each cell coloured by item count. Implemented as a pure React table with inline CSS colouring — no charting library required.

**Value**  
Gives engineering managers an at-a-glance view of where technical debt is concentrated across a solution.

**Complexity** M

**Priority** P3

**Dependencies** BL-001.

---

### BL-072 · Application Insights Telemetry Dashboard

**Description**  
Surface a read-only **Telemetry** section (visible only to site owners, controlled by a new property pane toggle `showTelemetry`) that queries the Application Insights REST API for the web part's telemetry events: most-viewed solutions, average load time, most-used filters, and error rate over the last 30 days. The Application Insights app ID and API key are stored in Azure Key Vault and accessed via the BL-010 proxy.

**Value**  
Gives teams data-driven insights into how the dashboard is used, enabling prioritisation of UI improvements and performance fixes.

**Complexity** L

**Priority** P3

**Dependencies** BL-010 (proxy for API key management); Application Insights resource configured with the web part's telemetry instrumentation key.

---

### BL-073 · Solution Health Trend Chart

**Description**  
Add a **Trends** tab to the solution detail panel that plots the `docCompleteness` percentage and open technical debt count over time. Derive historical data by reading the `Modified` and `DocCompleteness` columns from the **Solution Registry** list version history via the SharePoint `/_api/web/lists/.../_vti_history` endpoint. Render as a lightweight SVG sparkline (no charting library).

**Value**  
Provides a longitudinal view of solution health, enabling teams to demonstrate continuous improvement in documentation and debt reduction.

**Complexity** M

**Priority** P4

**Dependencies** BL-001; SharePoint list versioning must be enabled on the **Solution Registry** list.

---

### BL-074 · Cross-Solution Comparison View

**Description**  
Add a **Compare** mode to the main dashboard (activated by selecting two or more solutions from a multi-select overlay). Show a side-by-side table comparing the selected solutions on: status, docCompleteness, open debt count, latest version, health indicators, and accessibility status. Maximum four solutions can be compared at once.

**Value**  
Helps programme managers and architects quickly identify which solutions need the most attention without reading each card individually.

**Complexity** M

**Priority** P4

**Dependencies** BL-001.

---

## 9. Release Management

---

### BL-080 · Release Approval Workflow via Power Automate

**Description**  
Create a Power Automate cloud flow that triggers when a new item is added to the **Solution Releases** list with `DeploymentStatus = Planned`. The flow sends an approval request to the solution owner and release manager. On approval, it updates `DeploymentStatus` to `InProgress` and sends a deployment confirmation notification. On rejection, it sets status to a new `OnHold` value and adds a rejection comment. The web part renders the updated status immediately on the next data refresh.

**Value**  
Formalises the release gate process within the existing SharePoint data model without requiring a separate project management tool.

**Complexity** M

**Priority** P3

**Dependencies** BL-001; Power Automate Premium licence; BL-006 (DeploymentStatus choices in the list should be finalised first).

---

### BL-081 · Semantic Version Linting on Release Entry

**Description**  
When a new release item is added to the **Solution Releases** list, a Power Automate flow validates that the `Version` field follows [semantic versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`) and that it is higher than the previous latest version for the same solution. If validation fails, the flow returns a validation error message and sets a new `ValidationStatus = Invalid` column, which the web part renders as a warning badge in the Releases tab.

**Value**  
Prevents data entry errors in version numbers that would cause incorrect sorting and comparison in the dashboard.

**Complexity** S

**Priority** P3

**Dependencies** BL-001; Power Automate Standard licence.

---

### BL-082 · Release Calendar View

**Description**  
Add a **Calendar** view option to the main dashboard (toggle between the default card grid and a calendar grid) showing all solutions with `DeploymentStatus = Planned` or `= InProgress` plotted on a monthly calendar by their planned release date. Implemented using a custom React calendar component rather than a third-party library.

**Value**  
Gives programme managers a forward-looking view of all upcoming releases across the portfolio, enabling conflict identification and resource planning.

**Complexity** L

**Priority** P4

**Dependencies** BL-001.

---

### BL-083 · Known Issues Tracking Integration

**Description**  
Add a **Known Issues** tab to the solution detail panel that reads from a new eighth SharePoint list: **Solution Known Issues** (`SolutionId`, `Title`, `Severity`, `Status`, `AffectedVersion`, `Workaround`, `GitHubIssueUrl`). Link items to the corresponding GitHub issue where applicable (rendered as a badge linking to the BL-010 proxy for GitHub issue details).

**Value**  
Gives users and administrators immediate visibility into active known issues without navigating to GitHub or a separate ITSM system.

**Complexity** M

**Priority** P4

**Dependencies** BL-001; BL-010 (optional for GitHub issue linking); new eighth SharePoint list schema.

---

## 10. Architecture Visualization

---

### BL-090 · Inline SVG Diagram Preview

**Description**  
For architecture assets of type `SVG` or `PNG` that include a `PreviewUrl`, render an inline image preview within the **Architecture** tab of the solution detail panel. Show the image in a scrollable lightbox when clicked. For SVG assets, sanitise the SVG markup server-side (via Azure Function) before injecting it into the DOM to prevent XSS.

**Value**  
Eliminates the need to open a separate browser tab to view architecture diagrams, keeping the review workflow within the dashboard.

**Complexity** M

**Priority** P2

**Dependencies** `PreviewAvailable` and `PreviewUrl` columns already exist in the schema (BL-001 to surface them from SharePoint). XSS sanitisation requires BL-010 proxy.

---

### BL-091 · Draw.io Diagram Viewer Integration

**Description**  
Add an embedded [Draw.io viewer](https://www.diagrams.net/) (using the `diagrams.net` iframe embedding API) for architecture assets of type `Draw.io`. When the user selects such an asset, load the diagram in a full-panel iframe within the Architecture tab. Support both SharePoint-hosted `.drawio` files (via SharePoint file URL) and GitHub-hosted files (via the BL-010 proxy).

**Value**  
Provides rich, interactive architecture diagram viewing without requiring users to have Draw.io installed locally.

**Complexity** M

**Priority** P3

**Dependencies** BL-090; BL-001; BL-010 (for GitHub-hosted files). CSP review required (BL-061) for the `diagrams.net` origin.

---

### BL-092 · Automated Dependency Graph Generation

**Description**  
For each solution, generate a dependency graph visualisation from the **Solution Integrations** list data. Represent each integration as a directed edge between the current solution and the external system, coloured by integration direction (inbound / outbound / bidirectional) and status (active / degraded / inactive). Render the graph as an SVG using a simple force-directed layout algorithm implemented in pure TypeScript (no D3.js). Include the graph as a new section in the **Architecture** tab.

**Value**  
Provides an instantly understandable view of inter-system dependencies without requiring architects to maintain a separate dependency diagram manually.

**Complexity** L

**Priority** P3

**Dependencies** BL-001 (integrations must be read from SharePoint); BL-090 (SVG rendering approach).

---

### BL-093 · Architecture Asset Version History Timeline

**Description**  
For each architecture asset in the **Solution Architecture Assets** list, add version history tracking by reading the SharePoint list item version history. Display a collapsible version history timeline below each asset entry in the Architecture tab, showing who changed the asset, when, and what version number was set. Allow users to download a specific historical version's URL.

**Value**  
Supports governance and audit requirements by providing a traceable history of architecture changes without a separate document management system.

**Complexity** M

**Priority** P4

**Dependencies** BL-001; SharePoint list versioning must be enabled on the **Solution Architecture Assets** list.

---

### BL-094 · Viva Connections Adaptive Card Extension (ACE)

**Description**  
Create a Viva Connections ACE that surfaces a summary card for each Tech Elixir solution in the Viva Connections dashboard. The card shows: solution name, status badge, documentation completeness percentage, most-recent release version, and a quick link to the full dashboard page. The ACE reads from the same SharePoint lists as the web part (or mock data when `useMockData` is true) and shares the `SharePointDataService` code via a shared library or npm workspace.

**Value**  
Extends the dashboard's reach to the Viva Connections mobile experience, allowing on-the-go access to solution status without a full browser session.

**Complexity** L

**Priority** P4

**Dependencies** BL-001; Viva Connections licensing on the tenant.

---

## Backlog Summary

| ID | Title | Priority | Complexity |
|---|---|---|---|
| BL-001 | Full SharePoint List Mapping | P1 | M |
| BL-002 | Editable Mode | P2 | M |
| BL-003 | Client-Side Caching Layer | P2 | S |
| BL-004 | GitHub Actions CI Workflow | P2 | S |
| BL-005 | Inline Error Recovery in Detail Panel | P3 | S |
| BL-006 | App Type Auto-Detection | P3 | S |
| BL-010 | Live GitHub Metadata via Proxy | P2 | L |
| BL-011 | GitHub Actions Status Widget | P3 | M |
| BL-012 | GitHub Projects Kanban Surface | P3 | L |
| BL-013 | Automated Release Notes from GitHub | P3 | M |
| BL-014 | Dependabot / Security Advisory Feed | P3 | M |
| BL-020 | Power Platform Live Status | P2 | L |
| BL-021 | Power BI Embedded Report Panel | P3 | M |
| BL-022 | Power Automate Flow Trigger Buttons | P4 | M |
| BL-023 | Dataverse Table Row Count | P4 | M |
| BL-030 | AI Documentation Suggestions | P3 | L |
| BL-031 | AI Release Notes Summarisation | P3 | M |
| BL-032 | AI Technical Debt Remediation Suggestions | P4 | M |
| BL-033 | AI Accessibility Guidance Generator | P4 | M |
| BL-040 | Idempotent Column/View Updates in PS | P2 | S |
| BL-041 | PnP Provisioning Template | P2 | M |
| BL-042 | Site Design Integration | P3 | M |
| BL-043 | Automated Sample Data Import via CI | P3 | S |
| BL-044 | Deployment Health Check Script | P3 | S |
| BL-050 | jest-axe Integration | P1 | S |
| BL-051 | aria-live Audit and Remediation | P1 | XS |
| BL-052 | Focus Management Audit | P2 | S |
| BL-053 | Responsive Column Hiding | P2 | M |
| BL-054 | Formal WCAG 2.1 AA Audit | P2 | L |
| BL-055 | Motion Reduction Support | P3 | XS |
| BL-060 | Column-Level Permission Support | P2 | M |
| BL-061 | CSP Compliance Review | P2 | S |
| BL-062 | PIA Data Minimisation | P2 | S |
| BL-063 | Threat Model for GitHub Proxy | P3 | M |
| BL-064 | Secret Scanning in CI | P2 | XS |
| BL-070 | Documentation Completeness CSV Export | P2 | S |
| BL-071 | Technical Debt Heat Map | P3 | M |
| BL-072 | Application Insights Telemetry Dashboard | P3 | L |
| BL-073 | Solution Health Trend Chart | P4 | M |
| BL-074 | Cross-Solution Comparison View | P4 | M |
| BL-080 | Release Approval Workflow | P3 | M |
| BL-081 | Semantic Version Linting | P3 | S |
| BL-082 | Release Calendar View | P4 | L |
| BL-083 | Known Issues Tracking | P4 | M |
| BL-090 | Inline SVG Diagram Preview | P2 | M |
| BL-091 | Draw.io Diagram Viewer | P3 | M |
| BL-092 | Automated Dependency Graph | P3 | L |
| BL-093 | Architecture Asset Version History | P4 | M |
| BL-094 | Viva Connections ACE | P4 | L |
