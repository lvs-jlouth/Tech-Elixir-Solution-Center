# Tech Elixir Solution Center – Architecture

## High-Level Overview

```
SharePoint Page
└── Tech Elixir Solution Center Web Part
    ├── TechElixirSolutionCenterWebPart.ts   (SPFx entry point)
    │   └── TechElixirSolutionCenter.tsx     (root React component)
    │       ├── SolutionDashboard            (solution list + selection)
    │       └── SolutionDetailPanel          (per-solution detail tabs)
    │           ├── AppOverviewCard
    │           ├── DocCompletenessBar
    │           ├── ArchitectureDocs / ArchitectureAssets
    │           ├── ReleaseNotes / ReleaseTimeline
    │           ├── GitHubLinks / GitHubMetadataSection
    │           ├── PowerPlatformRefs
    │           ├── TechnicalDebt / TechnicalDebtRegister
    │           ├── AccessibilityReview / AccessibilityDashboard
    │           ├── SecurityStatus
    │           ├── DocumentMatrix
    │           ├── IntegrationInventory
    │           └── QuickLinks
    └── AppDataService.ts                    (data layer)
        ├── Mock data (mockApps.ts)
        └── PnPjs → SharePoint REST API
```

---

## Component Responsibilities

### Entry Point

| File | Role |
|---|---|
| `TechElixirSolutionCenterWebPart.ts` | SPFx `BaseClientSideWebPart` subclass. Renders the root React element and wires up the property pane. |

### Root Component

| Component | Role |
|---|---|
| `TechElixirSolutionCenter.tsx` | Bootstraps `AppDataService`, fetches application list on mount, and renders the `SolutionDashboard`. |

### Dashboard & Navigation

| Component | Role |
|---|---|
| `SolutionDashboard` | Renders the left-rail solution list (`SolutionCard` items) and hosts the `SolutionDetailPanel` for the selected solution. |
| `SolutionCard` | Single-solution summary card (name, status badge, doc completeness indicator). |
| `AppDetailPanel` | Legacy detail panel wrapper retained for backward compatibility. |
| `SolutionDetailPanel` | Tabbed detail view for a single solution containing all feature sections. |

### Feature Sections

| Component | Data rendered |
|---|---|
| `AppOverviewCard` | Name, description, status, owner, tags |
| `DocCompletenessBar` | Percentage progress bar |
| `ArchitectureDocs` | Links to architecture documents with metadata |
| `ArchitectureAssets` | Diagram assets with type and preview |
| `ReleaseNotes` | Collapsible version history |
| `ReleaseTimeline` | Visual timeline view of releases |
| `GitHubLinks` | Repository URL and links to Issues, PRs, Projects, Actions |
| `GitHubMetadataSection` | GitHub metadata display block |
| `PowerPlatformRefs` | Power Apps, Power Automate, Dataverse, and Connector records |
| `TechnicalDebt` | Severity-tagged debt items |
| `TechnicalDebtRegister` | Full debt register view |
| `AccessibilityReview` | WCAG checklist per solution |
| `AccessibilityDashboard` | Summary dashboard for accessibility checks |
| `SecurityStatus` | Threat model, data classification, security review, PIA |
| `DocumentMatrix` | Solution documentation completeness matrix |
| `IntegrationInventory` | Upstream/downstream system integrations |
| `QuickLinks` | Icon-button grid of document links |

### Shared UI

| Component | Role |
|---|---|
| `StatusBadge` | Coloured pill showing Active / InDevelopment / Deprecated / Planned |
| `HealthIndicator` | Visual health signal |
| `EmptyState` | Placeholder when a section has no data |
| `ErrorState` | Error boundary display |
| `LoadingState` | Loading spinner |

---

## Data Layer

### `AppDataService`

`src/webparts/techElixirSolutionCenter/services/AppDataService.ts`

The service is constructed once per web part render with:
- **`context`** – the SPFx `WebPartContext` (needed for PnPjs)
- **`listName`** – the primary list name from property pane

If `useMockData` is `true` (or `listName` is empty), all methods return data from `mockApps.ts`. On any SharePoint error, the service automatically falls back to mock data.

Public methods:

| Method | Description |
|---|---|
| `getApplications()` | Returns all `IApplication` records |
| `getApplicationById(id)` | Returns a single application by its SharePoint `Id` |
| `searchApplications(query)` | Filters by name, description, or tags |

### Data Models (`src/.../models/IApplication.ts`)

Key interfaces:

| Interface | Purpose |
|---|---|
| `IApplication` | Top-level solution record |
| `IArchitectureDoc` | Architecture document link with metadata |
| `IReleaseNote` | Release version with changes and deployment status |
| `ITechnicalDebtItem` | Technical debt item with severity and remediation |
| `IAccessibilityCheck` | WCAG-mapped accessibility check |
| `ISecurityStatus` | Security documentation completion statuses |
| `IPowerPlatformComponent` | Power Platform component reference |
| `IQuickLink` | Quick-link label and URL |

---

## Data Flow

```
Page Load
  │
  ▼
TechElixirSolutionCenter.tsx (componentDidMount / useEffect)
  │
  ▼
AppDataService.getApplications()
  │
  ├── useMockData=true  →  mockApps.ts  →  IApplication[]
  │
  └── useMockData=false →  PnPjs → SharePoint REST
        ├── Success  →  map items → IApplication[]
        └── Error    →  fall back to mockApps.ts
  │
  ▼
State: applications: IApplication[], selectedId: string
  │
  ▼
SolutionDashboard → SolutionDetailPanel → feature components
```

---

## Theming

The web part subscribes to `onThemeChanged` and applies the following CSS custom properties to its root element:

| CSS variable | Source |
|---|---|
| `--bodyText` | `semanticColors.bodyText` |
| `--link` | `semanticColors.link` |
| `--linkHovered` | `semanticColors.linkHovered` |

Dark theme support is automatic when the SharePoint page switches theme.
