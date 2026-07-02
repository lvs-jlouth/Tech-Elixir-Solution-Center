# Tech Elixir Solution Center – SharePoint Backend Schema

This document defines the SharePoint lists required when the web part is configured to use **SharePoint Lists mode** (i.e. `useMockData` is toggled off in the property pane).

> The existing [`docs/sharepoint-backend-lists.md`](sharepoint-backend-lists.md) contains the full provisioning reference. This document is a shorter summary intended as a quick-reference schema guide. For provisioning steps, see [docs/03-installation-guide.md](03-installation-guide.md).

---

## List Relationships

```
Solution Registry (parent)
├── Solution Documents          (SolutionId → Id)
├── Solution Releases           (SolutionId → Id)
├── Solution Technical Debt     (SolutionId → Id)
├── Solution Architecture Assets(SolutionId → Id)
├── Solution Integrations       (SolutionId → Id)
└── Solution Accessibility Checks(SolutionId → Id)
```

All child lists link back to the parent via a **single-line-of-text** `SolutionId` column that stores the parent list item `Id` as text. This avoids lookup throttling and simplifies CSV/PowerShell imports.

---

## 1) Solution Registry

**Default list name:** `Solution Registry`  
**Purpose:** Master list — one item per tracked solution/application.

| Column | Internal name | Type | Required | Notes |
|---|---|---|---|---|
| Title | `Title` | Single line of text | ✅ | Solution name shown in the UI |
| Description | `Description` | Multiple lines of text | | Overview text |
| Solution Status | `SolutionStatus` | Choice | | Active / InDevelopment / Deprecated / Planned |
| App Status | `AppStatus` | Choice | | Fallback if `SolutionStatus` is blank |
| Owner | `Owner` | Single line of text | | Team or person |
| App Owner | `AppOwner` | Single line of text | | Fallback if `Owner` is blank |
| Doc Completeness | `DocCompleteness` | Number (0–100) | | Documentation completion percentage |
| GitHub Repo URL | `GithubRepoUrl` | Hyperlink | | Repository link |
| Tags | `Tags` | Single line of text | | Semicolon-separated (e.g. `Finance;SharePoint`) |

---

## 2) Solution Documents

**Default list name:** `Solution Documents`  
**Purpose:** Documentation matrix records — one item per document section per solution.

| Column | Internal name | Type | Required | Notes |
|---|---|---|---|---|
| Solution Id | `SolutionId` | Single line of text | ✅ | Parent solution Id |
| Section Key | `SectionKey` | Single line of text | ✅ | Logical key (e.g. `architecture`) |
| Section Title | `SectionTitle` | Single line of text | ✅ | Display heading |
| Status | `Status` | Choice | ✅ | Current / Outdated / Missing / Draft |
| Url | `Url` | Hyperlink | | Document URL |
| Last Updated | `LastUpdated` | Date and Time | | |
| Owner | `Owner` | Single line of text | | |
| Notes | `Notes` | Multiple lines of text | | |

---

## 3) Solution Releases

**Default list name:** `Solution Releases`  
**Purpose:** Release history and deployment tracking per solution.

| Column | Internal name | Type | Required | Notes |
|---|---|---|---|---|
| Solution Id | `SolutionId` | Single line of text | ✅ | Parent solution Id |
| Version | `Version` | Single line of text | ✅ | e.g. `2.4.0` |
| Release Date | `ReleaseDate` | Date and Time | ✅ | |
| Release Type | `ReleaseType` | Choice | | Major / Minor / Patch / Hotfix |
| Summary | `Summary` | Multiple lines of text | | High-level summary |
| Changes | `Changes` | Multiple lines of text | | Semicolon-separated change list |
| Documentation Changes | `DocumentationChanges` | Multiple lines of text | | |
| GitHub Release URL | `GithubReleaseUrl` | Hyperlink | | |
| Deployment Status | `DeploymentStatus` | Choice | | Deployed / InProgress / Planned / Failed |
| Known Issues | `KnownIssues` | Multiple lines of text | | |

---

## 4) Solution Technical Debt

**Default list name:** `Solution Technical Debt`  
**Purpose:** Engineering debt backlog with severity and remediation tracking.

| Column | Internal name | Type | Required | Notes |
|---|---|---|---|---|
| Title | `Title` | Single line of text | ✅ | Debt item title |
| Solution Id | `SolutionId` | Single line of text | ✅ | Parent solution Id |
| Description | `Description` | Multiple lines of text | | |
| Category | `Category` | Choice | ✅ | Architecture / Security / Performance / etc. |
| Severity | `Severity` | Choice | ✅ | Critical / High / Medium / Low |
| Impact | `Impact` | Multiple lines of text | | Business/technical impact |
| Suggested Remediation | `SuggestedRemediation` | Multiple lines of text | | |
| Owner | `Owner` | Single line of text | | |
| Target Release | `TargetRelease` | Single line of text | | |
| Status | `Status` | Choice | ✅ | Open / InProgress / Resolved |

---

## 5) Solution Architecture Assets

**Default list name:** `Solution Architecture Assets`  
**Purpose:** Architecture diagrams and design artifacts.

| Column | Internal name | Type | Required | Notes |
|---|---|---|---|---|
| Title | `Title` | Single line of text | ✅ | Asset title |
| Solution Id | `SolutionId` | Single line of text | ✅ | Parent solution Id |
| Url | `Url` | Hyperlink | ✅ | Link to the asset |
| Asset Type | `AssetType` | Choice | ✅ | SVG / PNG / PDF / VSDX / Draw.io / Markdown / etc. |
| Description | `Description` | Multiple lines of text | | |
| Version | `Version` | Single line of text | | e.g. `1.3` |
| Last Updated | `LastUpdated` | Date and Time | | |
| Owner | `Owner` | Single line of text | | |
| Preview Available | `PreviewAvailable` | Yes/No | | |
| Preview Url | `PreviewUrl` | Hyperlink | | |
| Category | `Category` | Choice | | Current State / Future State / Data Flow / Security / etc. |

---

## 6) Solution Integrations

**Default list name:** `Solution Integrations`  
**Purpose:** Upstream/downstream system integration inventory.

| Column | Internal name | Type | Required | Notes |
|---|---|---|---|---|
| Solution Id | `SolutionId` | Single line of text | ✅ | Parent solution Id |
| Name | `Name` | Single line of text | ✅ | Integration name |
| System Type | `SystemType` | Choice | ✅ | SharePoint / Dataverse / GitHub / External API / etc. |
| Direction | `Direction` | Choice | ✅ | Inbound / Outbound / Bidirectional |
| Authentication Type | `AuthenticationType` | Choice | ✅ | OAuth 2.0 / Managed Identity / API Key / etc. |
| Data Classification | `DataClassification` | Choice | ✅ | Public / Internal / Confidential / Restricted |
| Environment | `Environment` | Choice | ✅ | Development / Test / UAT / Production |
| Status | `Status` | Choice | ✅ | Active / Degraded / Inactive / Planned |
| Url | `Url` | Hyperlink | | Endpoint or home link |
| Notes | `Notes` | Multiple lines of text | | |

---

## 7) Solution Accessibility Checks

**Default list name:** `Solution Accessibility Checks`  
**Purpose:** WCAG-mapped accessibility compliance checks with remediation tracking.

| Column | Internal name | Type | Required | Notes |
|---|---|---|---|---|
| Solution Id | `SolutionId` | Single line of text | ✅ | Parent solution Id |
| Requirement | `Requirement` | Single line of text | ✅ | Accessibility requirement |
| WCAG Reference | `WcagReference` | Single line of text | | e.g. `WCAG 2.1.1` |
| Status | `Status` | Choice | ✅ | Pass / NeedsAttention / Blocked / NotReviewed |
| Impact Area | `ImpactArea` | Choice | ✅ | Visual / Auditory / Mobility / Cognitive / Keyboard Navigation / Screen Reader / Color Contrast / Motion Sensitivity |
| Notes | `Notes` | Multiple lines of text | | Findings |
| Remediation Guidance | `RemediationGuidance` | Multiple lines of text | | |
| Owner | `Owner` | Single line of text | | |
| Target Date | `TargetDate` | Date and Time | | |
| Related Document URL | `RelatedDocumentUrl` | Hyperlink | | Evidence link |

---

## Legacy List: TechElixirApps

The `sharepoint/assets/elements.xml` file provisions a simpler legacy list called **`TechElixirApps`** that is activated automatically when the solution feature is deployed via the app catalog. This list covers only the top-level `Solution Registry` fields and is used as a lightweight alternative when the full seven-list schema is not needed.

> If you use the PowerShell provisioning script (`scripts/Provision-TechElixirLists.ps1`), it creates the full seven-list schema. Set the list names in the property pane accordingly — see [docs/04-configuration-guide.md](04-configuration-guide.md).
