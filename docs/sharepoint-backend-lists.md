# Tech Elixir Solution Center – SharePoint Backend List Provisioning Guide

This document defines the SharePoint lists required to run the **Tech Elixir Solution Center** web part in SharePoint-data mode.

## Implementation notes for administrators

- Create all lists in the same site where the web part is deployed.
- Keep list names exactly as configured in the web part property pane (defaults shown below).
- `Title` is the default SharePoint field and is used by several mappings.
- The web part links child records to solutions by `SolutionId` (or `AppId`) matching the parent solution item `Id`.
- Use **single line of text** for ID-link fields (`SolutionId`, `AppId`) to avoid lookup throttling and simplify imports.

---

## 1) List: Solution Registry

- **Default list name:** `Solution Registry`
- **Purpose:** Master list of solutions/apps shown in the dashboard.

### Columns

| Column display name | Internal name | Type | Required | Example value | Notes |
|---|---|---|---|---|---|
| Title | `Title` | Single line of text | Yes | Finance Elixir | Solution name shown in UI |
| Description | `Description` | Multiple lines of text | No | Finance operations solution | Overview text |
| Solution Status | `SolutionStatus` | Choice | No | Active | Preferred status field |
| App Status | `AppStatus` | Choice | No | InDevelopment | Fallback if `SolutionStatus` is blank |
| Owner | `Owner` | Single line of text | No | Finance Team | Preferred owner field |
| App Owner | `AppOwner` | Single line of text | No | Finance CoE | Fallback owner field |
| Doc Completeness | `DocCompleteness` | Number (0–100) | No | 82 | Documentation completion percentage |
| GitHub Repo URL | `GithubRepoUrl` | Hyperlink | No | https://github.com/contoso/finance-elixir | Repository link |
| Tags | `Tags` | Single line of text | No | Finance;SharePoint;Power Platform | Semicolon-separated tags |

### Relationships

- Parent for all other lists.
- Child list records should set `SolutionId` or `AppId` to this list item **Id**.

### Recommended views

- **All Solutions (Default)** – columns: Title, SolutionStatus/AppStatus, Owner, DocCompleteness.
- **Active Solutions** – filtered where status = Active.
- **By Owner** – grouped by Owner.
- **Needs Documentation** – filtered `DocCompleteness < 70`.

---

## 2) List: Solution Documents

- **Default list name:** `Solution Documents`
- **Purpose:** Documentation matrix/detail records for each solution.

### Columns

| Column display name | Internal name | Type | Required | Example value | Notes |
|---|---|---|---|---|---|
| Title | `Title` | Single line of text | No | Architecture Overview | Fallback for section title |
| Solution Id | `SolutionId` | Single line of text | Yes | 1 | Match Solution Registry item Id |
| App Id | `AppId` | Single line of text | No | 1 | Optional alternate link field |
| Section Key | `SectionKey` | Single line of text | Yes | architecture | Logical section key |
| Section Number | `SectionNumber` | Single line of text | No | 2.1 | Optional numbering |
| Section Title | `SectionTitle` | Single line of text | Yes | Current State Architecture | Primary section title |
| Status | `Status` | Choice | Yes | Current | Values should match documentation status model |
| Url | `Url` | Hyperlink | No | https://contoso.sharepoint.com/... | Document URL |
| Last Updated | `LastUpdated` | Date and Time | No | 2026-06-15 | Last update date |
| Owner | `Owner` | Single line of text | No | Architecture Team | Document owner |
| Notes | `Notes` | Multiple lines of text | No | Awaiting review updates | Optional notes |

### Relationships

- Many documents to one solution via `SolutionId`/`AppId`.

### Recommended views

- **By Solution** – grouped by SolutionId.
- **Current Docs** – filtered Status = Current.
- **Outdated or Missing** – filtered Status in Outdated, Missing.
- **Recently Updated** – sorted by LastUpdated desc.

---

## 3) List: Solution Releases

- **Default list name:** `Solution Releases`
- **Purpose:** Release history, deployment state, and release notes per solution.

### Columns

| Column display name | Internal name | Type | Required | Example value | Notes |
|---|---|---|---|---|---|
| Title | `Title` | Single line of text | No | v2.4.0 | Fallback for version |
| Solution Id | `SolutionId` | Single line of text | Yes | 1 | Match parent solution |
| App Id | `AppId` | Single line of text | No | 1 | Optional alternate link field |
| Version | `Version` | Single line of text | Yes | 2.4.0 | Release version |
| Date | `Date` | Date and Time | No | 2026-06-20 | Date fallback |
| Release Date | `ReleaseDate` | Date and Time | Yes | 2026-06-20 | Preferred release date |
| Release Type | `ReleaseType` | Choice | No | Minor | Major/Minor/Patch/Hotfix/etc. |
| Summary | `Summary` | Multiple lines of text | No | Added API caching improvements | High-level summary |
| Changes | `Changes` | Multiple lines of text | No | Refactor auth;Improve telemetry | Semicolon-separated or multi-value text |
| Documentation Changes | `DocumentationChanges` | Multiple lines of text | No | Updated runbook;Updated ADR | Documentation delta |
| GitHub Release URL | `GithubReleaseUrl` | Hyperlink | No | https://github.com/.../releases/tag/v2.4.0 | Optional |
| Deployment Status | `DeploymentStatus` | Choice | No | Deployed | Deployed/InProgress/Failed/etc. |
| Release Owner | `ReleaseOwner` | Single line of text | No | DevOps Team | Owner |
| Known Issues | `KnownIssues` | Multiple lines of text | No | Retry warning on first sync | Optional |

### Relationships

- Many releases to one solution via `SolutionId`/`AppId`.

### Recommended views

- **Release Timeline** – sorted by ReleaseDate desc.
- **By Solution** – grouped by SolutionId.
- **Pending/Failed Deployments** – filtered deployment status in Planned, InProgress, Failed.
- **Major Releases** – filtered ReleaseType = Major.

---

## 4) List: Solution Technical Debt

- **Default list name:** `Solution Technical Debt`
- **Purpose:** Backlog of engineering debt and remediation tracking by solution.

### Columns

| Column display name | Internal name | Type | Required | Example value | Notes |
|---|---|---|---|---|---|
| Title | `Title` | Single line of text | Yes | Replace legacy auth flow | Debt title |
| Solution Id | `SolutionId` | Single line of text | Yes | 1 | Match parent solution |
| App Id | `AppId` | Single line of text | No | 1 | Optional alternate link field |
| Description | `Description` | Multiple lines of text | No | Uses deprecated token logic | Debt details |
| Category | `Category` | Choice | Yes | Security | Architecture/Security/etc. |
| Severity | `Severity` | Choice | Yes | High | Critical/High/Medium/Low |
| Impact | `Impact` | Multiple lines of text | No | Elevated risk during rotation | Business/technical impact |
| Suggested Remediation | `SuggestedRemediation` | Multiple lines of text | No | Move to managed identity | Proposed fix |
| Owner | `Owner` | Single line of text | No | Platform Security | Responsible owner |
| Target Release | `TargetRelease` | Single line of text | No | 2.5.0 | Target release marker |
| Status | `Status` | Choice | Yes | Open | Open/InProgress/Resolved |
| Created Date | `CreatedDate` | Date and Time | No | 2026-05-10 | Optional explicit date |
| Last Updated Date | `LastUpdatedDate` | Date and Time | No | 2026-06-18 | Optional explicit date |

### Relationships

- Many debt records to one solution via `SolutionId`/`AppId`.

### Recommended views

- **Open Debt** – filtered Status != Resolved.
- **Critical & High** – filtered Severity in Critical, High.
- **By Solution** – grouped by SolutionId.
- **By Owner** – grouped by Owner.

---

## 5) List: Solution Architecture Assets

- **Default list name:** `Solution Architecture Assets`
- **Purpose:** Architecture diagrams and supporting design artifacts per solution.

### Columns

| Column display name | Internal name | Type | Required | Example value | Notes |
|---|---|---|---|---|---|
| Title | `Title` | Single line of text | Yes | Target Architecture Diagram | Asset title |
| Solution Id | `SolutionId` | Single line of text | Yes | 1 | Match parent solution |
| App Id | `AppId` | Single line of text | No | 1 | Optional alternate link field |
| Url | `Url` | Hyperlink | Yes | https://contoso.sharepoint.com/.../diagram.vsdx | Primary asset link |
| Asset Type | `AssetType` | Choice | Yes | VSDX | SVG/PNG/PDF/VSDX/etc. |
| Description | `Description` | Multiple lines of text | No | Logical application topology | Asset description |
| Version | `Version` | Single line of text | No | 1.3 | Artifact version |
| Last Updated | `LastUpdated` | Date and Time | No | 2026-06-01 | Last revision date |
| Owner | `Owner` | Single line of text | No | Enterprise Architecture | Asset owner |
| Preview Available | `PreviewAvailable` | Yes/No | No | Yes | Indicates preview link available |
| Preview Url | `PreviewUrl` | Hyperlink | No | https://contoso.sharepoint.com/.../preview.png | Optional preview |
| Category | `Category` | Choice | No | Future State | Current State/Future State/etc. |

### Relationships

- Many architecture assets to one solution via `SolutionId`/`AppId`.

### Recommended views

- **By Solution** – grouped by SolutionId.
- **Future State Assets** – filtered Category = Future State.
- **Assets Missing Preview** – filtered PreviewAvailable = No.
- **Recently Updated Assets** – sorted by LastUpdated desc.

---

## 6) List: Solution Integrations

- **Default list name:** `Solution Integrations`
- **Purpose:** Integration inventory for upstream/downstream systems used by each solution.

### Columns

| Column display name | Internal name | Type | Required | Example value | Notes |
|---|---|---|---|---|---|
| Title | `Title` | Single line of text | No | Finance API Connector | Fallback for Name |
| Solution Id | `SolutionId` | Single line of text | Yes | 1 | Match parent solution |
| App Id | `AppId` | Single line of text | No | 1 | Optional alternate link field |
| Name | `Name` | Single line of text | Yes | SAP Finance API | Integration name |
| System Type | `SystemType` | Choice | Yes | External API | SharePoint/Dataverse/GitHub/etc. |
| Direction | `Direction` | Choice | Yes | Bidirectional | Inbound/Outbound/Bidirectional |
| Authentication Type | `AuthenticationType` | Choice | Yes | OAuth 2.0 | Auth mechanism |
| Data Classification | `DataClassification` | Choice | Yes | Confidential | Public/Internal/Confidential/Restricted |
| Url | `Url` | Hyperlink | No | https://api.contoso.com/finance | Endpoint/home link |
| Documentation Url | `DocumentationUrl` | Hyperlink | No | https://wiki.contoso.com/integrations/finance | Supporting docs |
| Notes | `Notes` | Multiple lines of text | No | Rate limited at 500 RPM | Notes |
| Environment | `Environment` | Choice | Yes | Production | Development/Test/UAT/Production |
| Status | `Status` | Choice | Yes | Active | Active/Degraded/Inactive/Planned |
| Owner | `Owner` | Single line of text | No | Integration Team | Owner |

### Relationships

- Many integrations to one solution via `SolutionId`/`AppId`.

### Recommended views

- **By Solution** – grouped by SolutionId.
- **Production Integrations** – filtered Environment = Production.
- **Degraded/Inactive** – filtered Status in Degraded, Inactive.
- **By System Type** – grouped by SystemType.

---

## 7) List: Solution Accessibility Checks

- **Default list name:** `Solution Accessibility Checks`
- **Purpose:** Accessibility compliance checks mapped to WCAG and remediation status.

### Columns

| Column display name | Internal name | Type | Required | Example value | Notes |
|---|---|---|---|---|---|
| Title | `Title` | Single line of text | No | Keyboard Focus Order | Fallback for Requirement |
| Solution Id | `SolutionId` | Single line of text | Yes | 1 | Match parent solution |
| App Id | `AppId` | Single line of text | No | 1 | Optional alternate link field |
| Requirement | `Requirement` | Single line of text | Yes | All interactive controls are keyboard reachable | Main check requirement |
| WCAG Reference | `WcagReference` | Single line of text | No | WCAG 2.1.1 | Reference ID |
| Status | `Status` | Choice | Yes | NeedsAttention | Pass/NeedsAttention/Blocked/NotReviewed |
| Impact Area | `ImpactArea` | Choice | Yes | Keyboard Navigation | Visual/Auditory/Mobility/etc. |
| Notes | `Notes` | Multiple lines of text | No | Modal trap on settings panel | Findings |
| Remediation Guidance | `RemediationGuidance` | Multiple lines of text | No | Implement focus trap and escape handling | Fix guidance |
| Owner | `Owner` | Single line of text | No | Accessibility Champion | Responsible person/team |
| Target Date | `TargetDate` | Date and Time | No | 2026-07-30 | Planned resolution date |
| Related Document URL | `RelatedDocumentUrl` | Hyperlink | No | https://contoso.sharepoint.com/.../a11y-report | Evidence/report link |

### Relationships

- Many accessibility checks to one solution via `SolutionId`/`AppId`.

### Recommended views

- **By Solution** – grouped by SolutionId.
- **Open Accessibility Issues** – filtered Status in NeedsAttention, Blocked, NotReviewed.
- **Due Soon** – filtered TargetDate within next 30 days.
- **By Impact Area** – grouped by ImpactArea.

---

## Cross-list relationship model (recommended)

- `Solution Registry` is the parent list.
- Every child list item should contain `SolutionId` (preferred) and may also contain `AppId`.
- Store `SolutionId`/`AppId` as text matching parent list item `Id` for consistent filtering in the current web part implementation.

## Optional governance recommendations

- Enable versioning on all lists.
- Require content approval only if your process demands it (not required by the web part).
- Add list-level permissions for sensitive lists (for example Technical Debt, Accessibility Checks) where needed.
