/**
 * mockCatalog.ts
 *
 * Comprehensive mock dataset used by MockDataService.  Each collection is keyed
 * by application id ('1' … '4') so that individual service methods can filter
 * efficiently without loading the full IApplication graph.
 *
 * Application ids
 *   '1' – Finance Elixir
 *   '2' – Fitness Elixir
 *   '3' – Script Elixir
 *   '4' – Tech Elixir Solution Center
 */

import {
  IDocument,
  IIntegration,
  IHealthSummary
} from '../models/IMockDataTypes';
import {
  IApplication,
  IArchitectureDoc,
  IAccessibilityItem,
  ITechnicalDebtItem,
  IReleaseNote
} from '../models/IApplication';
import { DocumentationStatus, Environment, HealthStatus } from '../constants';

// ---------------------------------------------------------------------------
// Re-export the complete IApplication records so that MockDataService can
// return them without depending on the legacy mockApps.ts file.
// ---------------------------------------------------------------------------

export const MOCK_APPLICATIONS: IApplication[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // Finance Elixir
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '1',
    name: 'Finance Elixir',
    shortName: 'FE',
    appType: 'SharePointSolution',
    description:
      'A SharePoint-based financial management and reporting application that streamlines budget tracking, expense approvals, and financial dashboards for the organization.',
    status: 'Active',
    owner: 'Finance Team',
    docCompleteness: 78,
    tags: ['Finance', 'SharePoint', 'Power BI', 'Reporting'],
    githubRepoUrl: 'https://github.com/lvs-jlouth/finance-elixir',
    architectureDocs: [
      {
        title: 'Finance Elixir – Solution Architecture',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/01-Architecture.docx',
        description:
          'High-level solution architecture covering SharePoint lists, Power BI integration, and Power Automate flows.',
        lastUpdated: '2024-03-15'
      },
      {
        title: 'Data Flow Diagram',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/02-Data-Model.vsdx',
        description: 'Data flow between SharePoint, Dataverse, and Power BI.',
        lastUpdated: '2024-02-20'
      }
    ],
    releaseNotes: [
      {
        version: '2.1.0',
        date: '2024-04-01',
        summary:
          'Added Power BI embedded reports and improved budget approval workflow.',
        changes: [
          'Integrated Power BI dashboard into the SharePoint page',
          'Added multi-level budget approval workflow via Power Automate',
          'Fixed date picker accessibility issue on expense submission form',
          'Improved mobile responsiveness for Finance dashboard'
        ]
      },
      {
        version: '2.0.0',
        date: '2024-01-15',
        summary: 'Major redesign with Fluent UI v8 components and PnPjs v3.',
        changes: [
          'Migrated to Fluent UI v8',
          'Upgraded PnPjs to v3',
          'Introduced role-based visibility for finance reports',
          'Added CSV export for expense reports'
        ]
      }
    ],
    powerPlatformComponents: [
      {
        name: 'Budget Approval Flow',
        type: 'PowerAutomate',
        url: 'https://make.powerautomate.com/environments/default/flows/budget-approval-flow',
        description: 'Multi-level approval flow for budget requests over $10,000.'
      },
      {
        name: 'Finance Dashboard App',
        type: 'PowerApp',
        url: 'https://make.powerapps.com/environments/default/apps/finance-dashboard',
        description: 'Canvas app for field finance data entry and review.'
      },
      {
        name: 'Expense Tracker Dataverse Table',
        type: 'Dataverse',
        description: 'Stores expense records linked to SharePoint user profiles.'
      }
    ],
    technicalDebt: [
      {
        id: 'FE-TD-001',
        title: 'Upgrade SPFx version from 1.15 to 1.18',
        description:
          'The web part was originally built on SPFx 1.15. Upgrading to 1.18.2 would bring Viva Connections support and improved build tooling.',
        category: 'DevOps',
        severity: 'Medium',
        impact:
          'Continued use of older toolchain increases maintenance overhead and limits compatibility with newer SPFx capabilities.',
        suggestedRemediation:
          'Plan and execute an SPFx framework upgrade, then run full regression validation in development and production environments.',
        owner: 'Tech Elixir Core Team',
        targetRelease: 'v2.2.0',
        status: 'Open',
        createdDate: '2024-01-10',
        lastUpdatedDate: '2024-04-18'
      },
      {
        id: 'FE-TD-002',
        title: 'Replace hardcoded SharePoint site URL',
        description:
          'Several components reference a hardcoded site URL instead of using context.pageContext.site.absoluteUrl.',
        category: 'SharePoint',
        severity: 'High',
        impact:
          'Hardcoded URLs can break deployments across tenants and environments, causing runtime failures and broken links.',
        suggestedRemediation:
          'Refactor all URL references to derive the base site URL from SharePoint context and centralize URL composition.',
        owner: 'Finance Team',
        targetRelease: 'v2.1.1',
        status: 'InProgress',
        createdDate: '2024-02-05',
        lastUpdatedDate: '2024-04-16'
      },
      {
        id: 'FE-TD-003',
        title: 'Add unit tests for AppDataService',
        description:
          'The data service layer has zero test coverage. Jest tests should be added.',
        category: 'Maintainability',
        severity: 'Low',
        impact:
          'Lack of automated tests makes future refactors riskier and slows delivery confidence.',
        suggestedRemediation:
          'Add Jest unit tests for list mapping, fallback behavior, and error handling in AppDataService.',
        owner: 'Finance Team',
        targetRelease: 'v2.2.0',
        status: 'Open',
        createdDate: '2024-03-01',
        lastUpdatedDate: '2024-04-12'
      }
    ],
    accessibilityItems: [
      {
        id: 'FE-A11Y-001',
        requirement: 'All images have descriptive alt text',
        wcagCriteria: '1.1.1 Non-text Content (A)',
        status: 'Pass'
      },
      {
        id: 'FE-A11Y-002',
        requirement: 'Color is not the only means of conveying information',
        wcagCriteria: '1.4.1 Use of Color (A)',
        status: 'NeedsReview',
        notes:
          'Budget status indicators rely solely on red/green color. Add icon or label.'
      },
      {
        id: 'FE-A11Y-003',
        requirement: 'Keyboard navigation works for all interactive elements',
        wcagCriteria: '2.1.1 Keyboard (A)',
        status: 'Pass'
      },
      {
        id: 'FE-A11Y-004',
        requirement: 'Form fields have accessible labels',
        wcagCriteria: '1.3.1 Info and Relationships (A)',
        status: 'Fail',
        notes: 'Expense date picker field is missing an aria-label.'
      }
    ],
    securityStatus: {
      threatModelComplete: 'Complete',
      dataClassificationComplete: 'Complete',
      securityReviewComplete: 'InProgress',
      privacyImpactAssessment: 'Complete',
      notes: 'Annual security review scheduled for Q2 2024.'
    },
    quickLinks: [
      {
        label: 'Architecture Doc',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/01-Architecture.docx',
        iconName: 'Documentation'
      },
      {
        label: 'GitHub Repo',
        url: 'https://github.com/lvs-jlouth/finance-elixir',
        iconName: 'CodeEdit'
      },
      {
        label: 'Power BI Report',
        url: 'https://app.powerbi.com/groups/me/reports/finance-elixir',
        iconName: 'BarChart4'
      },
      {
        label: 'Release Notes',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/ReleaseNotes.md',
        iconName: 'ReleaseGate'
      },
      {
        label: 'Test Plan',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/TestPlan.xlsx',
        iconName: 'TestPlan'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Fitness Elixir
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '2',
    name: 'Fitness Elixir',
    shortName: 'FitE',
    appType: 'PowerApp',
    description:
      'An employee wellness and fitness tracking application built on SharePoint and Power Platform, enabling staff to log activities, join challenges, and track team wellness goals.',
    status: 'Active',
    owner: 'HR & Wellness Team',
    docCompleteness: 55,
    tags: ['Wellness', 'SharePoint', 'Power Apps', 'Gamification'],
    githubRepoUrl: 'https://github.com/lvs-jlouth/fitness-elixir',
    architectureDocs: [
      {
        title: 'Fitness Elixir – Architecture Overview',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/01-Architecture.docx',
        description:
          'System design covering Power Apps, SharePoint lists, and gamification logic.',
        lastUpdated: '2024-02-10'
      }
    ],
    releaseNotes: [
      {
        version: '1.3.0',
        date: '2024-03-20',
        summary: 'Team challenge features and improved leaderboard.',
        changes: [
          'Added team-based fitness challenges',
          'Introduced leaderboard web part',
          'Fixed activity logging timezone issue',
          'Added badge system for milestone achievements'
        ]
      },
      {
        version: '1.2.0',
        date: '2023-12-05',
        summary: 'Power Apps integration and mobile improvements.',
        changes: [
          'Launched Fitness Elixir Power App for mobile activity logging',
          'Integrated with SharePoint lists via Power Automate',
          'Improved responsive layout for SharePoint mobile'
        ]
      }
    ],
    powerPlatformComponents: [
      {
        name: 'Fitness Activity Logger',
        type: 'PowerApp',
        url: 'https://make.powerapps.com/environments/default/apps/fitness-logger',
        description: 'Canvas app for employees to log daily fitness activities.'
      },
      {
        name: 'Challenge Notification Flow',
        type: 'PowerAutomate',
        url: 'https://make.powerautomate.com/environments/default/flows/challenge-notification',
        description:
          'Sends weekly challenge reminders and leaderboard updates via Teams.'
      }
    ],
    technicalDebt: [
      {
        id: 'FIT-TD-001',
        title: 'Documentation coverage below 60%',
        description:
          'Architecture documentation, API reference, and user guide are incomplete.',
        category: 'Documentation',
        severity: 'High',
        impact:
          'Incomplete documentation increases onboarding time and raises support effort for operations and enhancements.',
        suggestedRemediation:
          'Complete architecture, API, and user documentation and enforce doc updates in release readiness checks.',
        owner: 'HR & Wellness Team',
        targetRelease: 'v1.4.0',
        status: 'Open',
        createdDate: '2024-01-20',
        lastUpdatedDate: '2024-04-11'
      },
      {
        id: 'FIT-TD-002',
        title: 'Leaderboard calculation is O(n²)',
        description:
          'The leaderboard ranking algorithm iterates over all records for each user. Needs optimization for orgs with 500+ users.',
        category: 'Performance',
        severity: 'Medium',
        impact:
          'Performance degrades as participant counts grow, causing slow page loads and delayed ranking updates.',
        suggestedRemediation:
          'Replace nested iteration with a grouped aggregation approach and cache computed rankings.',
        owner: 'HR & Wellness Team',
        targetRelease: 'v1.5.0',
        status: 'Open',
        createdDate: '2024-03-10',
        lastUpdatedDate: '2024-04-19'
      }
    ],
    accessibilityItems: [
      {
        id: 'FIT-A11Y-001',
        requirement: 'All images have descriptive alt text',
        wcagCriteria: '1.1.1 Non-text Content (A)',
        status: 'Pass'
      },
      {
        id: 'FIT-A11Y-002',
        requirement: 'Sufficient color contrast for text',
        wcagCriteria: '1.4.3 Contrast (Minimum) (AA)',
        status: 'Fail',
        notes:
          'Leaderboard rank numbers use light gray text on white background (contrast ratio 2.5:1, needs 4.5:1).'
      },
      {
        id: 'FIT-A11Y-003',
        requirement: 'Focus is visible for all interactive elements',
        wcagCriteria: '2.4.7 Focus Visible (AA)',
        status: 'NeedsReview',
        notes:
          'Challenge cards may suppress default focus ring in some browser/theme combos.'
      }
    ],
    securityStatus: {
      threatModelComplete: 'NotStarted',
      dataClassificationComplete: 'InProgress',
      securityReviewComplete: 'NotStarted',
      privacyImpactAssessment: 'InProgress',
      notes: 'PIA in progress – wellness data may include sensitive health information.'
    },
    quickLinks: [
      {
        label: 'Architecture Doc',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/01-Architecture.docx',
        iconName: 'Documentation'
      },
      {
        label: 'GitHub Repo',
        url: 'https://github.com/lvs-jlouth/fitness-elixir',
        iconName: 'CodeEdit'
      },
      {
        label: 'Power App',
        url: 'https://make.powerapps.com/environments/default/apps/fitness-logger',
        iconName: 'PowerApps'
      },
      {
        label: 'User Guide',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/07-User-Guide.pdf',
        iconName: 'BookAnswers'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Script Elixir
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '3',
    name: 'Script Elixir',
    shortName: 'SE',
    appType: 'HybridSolution',
    description:
      'A centralized script library and automation hub for SharePoint administrators, allowing teams to discover, share, and execute PnP PowerShell, SPFx, and Graph API scripts through a governed SharePoint interface.',
    status: 'InDevelopment',
    owner: 'IT/SharePoint Admin Team',
    docCompleteness: 35,
    tags: ['Automation', 'PowerShell', 'PnP', 'Graph API', 'Admin'],
    githubRepoUrl: 'https://github.com/lvs-jlouth/script-elixir',
    architectureDocs: [
      {
        title: 'Script Elixir – Draft Architecture',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/ScriptElixir/01-Architecture-Draft.docx',
        description: 'Initial architecture draft for the script library system.',
        lastUpdated: '2024-04-05'
      }
    ],
    releaseNotes: [
      {
        version: '0.2.0-beta',
        date: '2024-04-10',
        summary: 'Beta release of script catalog and search functionality.',
        changes: [
          'Implemented script catalog SharePoint list',
          'Added full-text search for scripts',
          'Draft PowerShell execution wrapper (admin only)',
          'Tag-based filtering for script categories'
        ]
      }
    ],
    powerPlatformComponents: [
      {
        name: 'Script Approval Workflow',
        type: 'PowerAutomate',
        description:
          'Peer-review approval flow before new scripts are published to the catalog.'
      }
    ],
    technicalDebt: [
      {
        id: 'SE-TD-001',
        title: 'No automated tests',
        description:
          'Zero test coverage across all components. Needs Jest unit tests and integration tests.',
        category: 'Maintainability',
        severity: 'Critical',
        impact:
          'Without tests, regressions are likely and release risk remains high for every code change.',
        suggestedRemediation:
          'Implement baseline unit and integration test suites and include them in CI quality gates.',
        owner: 'IT/SharePoint Admin Team',
        targetRelease: 'v0.3.0',
        status: 'Open',
        createdDate: '2024-03-15',
        lastUpdatedDate: '2024-04-20'
      },
      {
        id: 'SE-TD-002',
        title: 'Script execution security model undefined',
        description:
          'The mechanism for safely executing scripts needs a formal security review and sandboxing approach.',
        category: 'Security',
        severity: 'Critical',
        impact:
          'Undefined execution controls could expose administrative scripts to misuse or privilege escalation.',
        suggestedRemediation:
          'Define and approve a least-privilege execution model with sandboxing, audit logging, and policy enforcement.',
        owner: 'IT/SharePoint Admin Team',
        targetRelease: 'v0.3.0',
        status: 'Open',
        createdDate: '2024-03-15',
        lastUpdatedDate: '2024-04-21'
      },
      {
        id: 'SE-TD-003',
        title: 'Architecture documentation incomplete',
        description:
          'Only a draft architecture document exists; full solution design not yet documented.',
        category: 'Architecture',
        severity: 'High',
        impact:
          'Incomplete architecture decisions hinder design reviews and delay readiness for broader rollout.',
        suggestedRemediation:
          'Publish complete architecture documentation including data flow, trust boundaries, and operational model.',
        owner: 'IT/SharePoint Admin Team',
        targetRelease: 'v0.3.0',
        status: 'Open',
        createdDate: '2024-04-01',
        lastUpdatedDate: '2024-04-22'
      }
    ],
    accessibilityItems: [
      {
        id: 'SE-A11Y-001',
        requirement: 'All images have descriptive alt text',
        wcagCriteria: '1.1.1 Non-text Content (A)',
        status: 'NeedsReview',
        notes: 'Not yet reviewed; application still in development.'
      },
      {
        id: 'SE-A11Y-002',
        requirement: 'Keyboard navigation works for all interactive elements',
        wcagCriteria: '2.1.1 Keyboard (A)',
        status: 'NeedsReview',
        notes: 'Not yet reviewed; application still in development.'
      }
    ],
    securityStatus: {
      threatModelComplete: 'NotStarted',
      dataClassificationComplete: 'NotStarted',
      securityReviewComplete: 'NotStarted',
      privacyImpactAssessment: 'NotStarted',
      notes:
        'Security documentation not yet started. Must be completed before GA release.'
    },
    quickLinks: [
      {
        label: 'Architecture Draft',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/ScriptElixir/01-Architecture-Draft.docx',
        iconName: 'Documentation'
      },
      {
        label: 'GitHub Repo',
        url: 'https://github.com/lvs-jlouth/script-elixir',
        iconName: 'CodeEdit'
      },
      {
        label: 'Project Board',
        url: 'https://github.com/lvs-jlouth/script-elixir/projects',
        iconName: 'ProjectLogo32'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Tech Elixir Solution Center
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '4',
    name: 'Tech Elixir Solution Center',
    shortName: 'TESC',
    appType: 'SPFxWebPart',
    description:
      'This web part itself — a living documentation and application engineering dashboard for all Tech Elixir SharePoint-based app builds.',
    status: 'InDevelopment',
    owner: 'Tech Elixir Core Team',
    docCompleteness: 60,
    tags: ['SPFx', 'React', 'TypeScript', 'Fluent UI', 'PnPjs'],
    githubRepoUrl: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center',
    architectureDocs: [
      {
        title: 'Solution Center – Architecture',
        url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/blob/main/README.md',
        description:
          'README with architecture overview, component structure, and setup guide.',
        lastUpdated: '2024-04-15'
      }
    ],
    releaseNotes: [
      {
        version: '1.0.0',
        date: '2024-04-15',
        summary: 'Initial release with full dashboard structure.',
        changes: [
          'SPFx 1.18.2 project scaffolding',
          'React component library with Fluent UI v8',
          'PnPjs v3 data service layer',
          'Mock data for all four Tech Elixir apps',
          'AppOverviewCard, DocCompletenessBar, ArchitectureDocs, ReleaseNotes, GitHubLinks, PowerPlatformRefs, TechnicalDebt, AccessibilityReview, SecurityStatus, QuickLinks components',
          'SharePoint list provisioning via Feature XML'
        ]
      }
    ],
    powerPlatformComponents: [],
    technicalDebt: [
      {
        id: 'TESC-TD-001',
        title: 'Wire real SharePoint list data',
        description:
          'AppDataService currently falls back to mock data when list is empty. Needs full list-to-model mapping.',
        category: 'SharePoint',
        severity: 'Medium',
        impact:
          'Reliance on mock fallback can obscure data quality issues and limits production readiness.',
        suggestedRemediation:
          'Implement robust SharePoint list mapping with explicit validation and telemetry for missing fields.',
        owner: 'Tech Elixir Core Team',
        targetRelease: 'v1.1.0',
        status: 'Open',
        createdDate: '2024-04-15',
        lastUpdatedDate: '2024-04-23'
      }
    ],
    accessibilityItems: [
      {
        id: 'TESC-A11Y-001',
        requirement: 'All images have descriptive alt text',
        wcagCriteria: '1.1.1 Non-text Content (A)',
        status: 'Pass'
      },
      {
        id: 'TESC-A11Y-002',
        requirement: 'Keyboard navigation works for all interactive elements',
        wcagCriteria: '2.1.1 Keyboard (A)',
        status: 'Pass'
      },
      {
        id: 'TESC-A11Y-003',
        requirement: 'Sufficient color contrast for text',
        wcagCriteria: '1.4.3 Contrast (Minimum) (AA)',
        status: 'NeedsReview',
        notes: 'Severity badge colors need contrast ratio verification.'
      }
    ],
    securityStatus: {
      threatModelComplete: 'NotStarted',
      dataClassificationComplete: 'InProgress',
      securityReviewComplete: 'NotStarted',
      privacyImpactAssessment: 'NotStarted',
      notes: 'Read-only dashboard; no PII stored. Data classification in progress.'
    },
    quickLinks: [
      {
        label: 'GitHub Repo',
        url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center',
        iconName: 'CodeEdit'
      },
      {
        label: 'README',
        url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/blob/main/README.md',
        iconName: 'Documentation'
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// Documents – per-section documentation records
// ---------------------------------------------------------------------------

const SP_BASE = 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents';

export const MOCK_DOCUMENTS: IDocument[] = [
  // ── Finance Elixir ────────────────────────────────────────────────────────
  {
    id: 'FE-DOC-00', appId: '1', sectionKey: '00-overview', sectionNumber: '00', sectionTitle: 'Overview',
    status: DocumentationStatus.Current,
    url: `${SP_BASE}/FinanceElixir/00-Overview.docx`,
    lastUpdated: '2024-03-20', owner: 'Finance Team',
    notes: 'Up to date following the 2.1.0 release.'
  },
  {
    id: 'FE-DOC-01', appId: '1', sectionKey: '01-architecture', sectionNumber: '01', sectionTitle: 'Architecture',
    status: DocumentationStatus.Current,
    url: `${SP_BASE}/FinanceElixir/01-Architecture.docx`,
    lastUpdated: '2024-03-15', owner: 'Finance Team'
  },
  {
    id: 'FE-DOC-02', appId: '1', sectionKey: '02-data-model', sectionNumber: '02', sectionTitle: 'Data Model',
    status: DocumentationStatus.Current,
    url: `${SP_BASE}/FinanceElixir/02-Data-Model.vsdx`,
    lastUpdated: '2024-02-20', owner: 'Finance Team'
  },
  {
    id: 'FE-DOC-03', appId: '1', sectionKey: '03-screen-catalogue', sectionNumber: '03', sectionTitle: 'Screen Catalogue',
    status: DocumentationStatus.Outdated,
    url: `${SP_BASE}/FinanceElixir/03-Screen-Catalogue.docx`,
    lastUpdated: '2023-11-01', owner: 'Finance Team',
    notes: 'Screens updated in 2.0.0 but catalogue not refreshed.'
  },
  {
    id: 'FE-DOC-04', appId: '1', sectionKey: '04-power-automate-flows', sectionNumber: '04', sectionTitle: 'Power Automate Flows',
    status: DocumentationStatus.Current,
    url: `${SP_BASE}/FinanceElixir/04-Power-Automate-Flows.docx`,
    lastUpdated: '2024-04-01', owner: 'Finance Team'
  },
  {
    id: 'FE-DOC-05', appId: '1', sectionKey: '05-security', sectionNumber: '05', sectionTitle: 'Security',
    status: DocumentationStatus.InReview,
    url: `${SP_BASE}/FinanceElixir/05-Security.docx`,
    lastUpdated: '2024-03-01', owner: 'Security Team',
    notes: 'Annual security review in progress – Q2 2024.'
  },
  {
    id: 'FE-DOC-06', appId: '1', sectionKey: '06-deployment-guide', sectionNumber: '06', sectionTitle: 'Deployment Guide',
    status: DocumentationStatus.Approved,
    url: `${SP_BASE}/FinanceElixir/06-Deployment-Guide.docx`,
    lastUpdated: '2024-01-20', owner: 'Finance Team'
  },
  {
    id: 'FE-DOC-07', appId: '1', sectionKey: '07-user-guide', sectionNumber: '07', sectionTitle: 'User Guide',
    status: DocumentationStatus.Current,
    url: `${SP_BASE}/FinanceElixir/07-User-Guide.pdf`,
    lastUpdated: '2024-04-02', owner: 'Finance Team'
  },
  {
    id: 'FE-DOC-08', appId: '1', sectionKey: '08-admin-guide', sectionNumber: '08', sectionTitle: 'Admin Guide',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/FinanceElixir/08-Admin-Guide-DRAFT.docx`,
    lastUpdated: '2024-02-14', owner: 'Finance Team',
    notes: 'Draft in progress – target approval date 2024-05-01.'
  },
  {
    id: 'FE-DOC-09', appId: '1', sectionKey: '09-roadmap', sectionNumber: '09', sectionTitle: 'Roadmap',
    status: DocumentationStatus.Current,
    url: `${SP_BASE}/FinanceElixir/09-Roadmap.docx`,
    lastUpdated: '2024-04-05', owner: 'Finance Team'
  },
  {
    id: 'FE-DOC-10', appId: '1', sectionKey: '10-appendices', sectionNumber: '10', sectionTitle: 'Appendices',
    status: DocumentationStatus.Missing,
    owner: 'Finance Team',
    notes: 'Appendices section not yet created.'
  },

  // ── Fitness Elixir ────────────────────────────────────────────────────────
  {
    id: 'FIT-DOC-00', appId: '2', sectionKey: '00-overview', sectionNumber: '00', sectionTitle: 'Overview',
    status: DocumentationStatus.Approved,
    url: `${SP_BASE}/FitnessElixir/00-Overview.docx`,
    lastUpdated: '2024-02-15', owner: 'HR & Wellness Team'
  },
  {
    id: 'FIT-DOC-01', appId: '2', sectionKey: '01-architecture', sectionNumber: '01', sectionTitle: 'Architecture',
    status: DocumentationStatus.Outdated,
    url: `${SP_BASE}/FitnessElixir/01-Architecture.docx`,
    lastUpdated: '2024-02-10', owner: 'HR & Wellness Team',
    notes: 'Does not reflect team challenge feature added in 1.3.0.'
  },
  {
    id: 'FIT-DOC-02', appId: '2', sectionKey: '02-data-model', sectionNumber: '02', sectionTitle: 'Data Model',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/FitnessElixir/02-Data-Model-DRAFT.docx`,
    lastUpdated: '2024-01-30', owner: 'HR & Wellness Team',
    notes: 'Draft incomplete – Dataverse tables not yet mapped.'
  },
  {
    id: 'FIT-DOC-03', appId: '2', sectionKey: '03-screen-catalogue', sectionNumber: '03', sectionTitle: 'Screen Catalogue',
    status: DocumentationStatus.Missing,
    owner: 'HR & Wellness Team',
    notes: 'Screen catalogue not started.'
  },
  {
    id: 'FIT-DOC-04', appId: '2', sectionKey: '04-power-automate-flows', sectionNumber: '04', sectionTitle: 'Power Automate Flows',
    status: DocumentationStatus.Current,
    url: `${SP_BASE}/FitnessElixir/04-Power-Automate-Flows.docx`,
    lastUpdated: '2024-03-22', owner: 'HR & Wellness Team'
  },
  {
    id: 'FIT-DOC-05', appId: '2', sectionKey: '05-security', sectionNumber: '05', sectionTitle: 'Security',
    status: DocumentationStatus.Missing,
    owner: 'Security Team',
    notes: 'PIA in progress but security document not yet created.'
  },
  {
    id: 'FIT-DOC-06', appId: '2', sectionKey: '06-deployment-guide', sectionNumber: '06', sectionTitle: 'Deployment Guide',
    status: DocumentationStatus.Approved,
    url: `${SP_BASE}/FitnessElixir/06-Deployment-Guide.docx`,
    lastUpdated: '2023-12-10', owner: 'HR & Wellness Team'
  },
  {
    id: 'FIT-DOC-07', appId: '2', sectionKey: '07-user-guide', sectionNumber: '07', sectionTitle: 'User Guide',
    status: DocumentationStatus.Current,
    url: `${SP_BASE}/FitnessElixir/07-User-Guide.pdf`,
    lastUpdated: '2024-03-25', owner: 'HR & Wellness Team'
  },
  {
    id: 'FIT-DOC-08', appId: '2', sectionKey: '08-admin-guide', sectionNumber: '08', sectionTitle: 'Admin Guide',
    status: DocumentationStatus.Missing,
    owner: 'HR & Wellness Team',
    notes: 'Admin guide not yet started.'
  },
  {
    id: 'FIT-DOC-09', appId: '2', sectionKey: '09-roadmap', sectionNumber: '09', sectionTitle: 'Roadmap',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/FitnessElixir/09-Roadmap-DRAFT.docx`,
    lastUpdated: '2024-04-01', owner: 'HR & Wellness Team'
  },
  {
    id: 'FIT-DOC-10', appId: '2', sectionKey: '10-appendices', sectionNumber: '10', sectionTitle: 'Appendices',
    status: DocumentationStatus.Missing,
    owner: 'HR & Wellness Team',
    notes: 'Appendices not yet created.'
  },

  // ── Script Elixir ─────────────────────────────────────────────────────────
  {
    id: 'SE-DOC-00', appId: '3', sectionKey: '00-overview', sectionNumber: '00', sectionTitle: 'Overview',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/ScriptElixir/00-Overview-DRAFT.docx`,
    lastUpdated: '2024-04-05', owner: 'IT/SharePoint Admin Team'
  },
  {
    id: 'SE-DOC-01', appId: '3', sectionKey: '01-architecture', sectionNumber: '01', sectionTitle: 'Architecture',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/ScriptElixir/01-Architecture-Draft.docx`,
    lastUpdated: '2024-04-05', owner: 'IT/SharePoint Admin Team',
    notes: 'Initial draft only; pending security sandboxing decisions.'
  },
  {
    id: 'SE-DOC-02', appId: '3', sectionKey: '02-data-model', sectionNumber: '02', sectionTitle: 'Data Model',
    status: DocumentationStatus.Missing,
    owner: 'IT/SharePoint Admin Team',
    notes: 'Not yet started.'
  },
  {
    id: 'SE-DOC-03', appId: '3', sectionKey: '03-screen-catalogue', sectionNumber: '03', sectionTitle: 'Screen Catalogue',
    status: DocumentationStatus.Missing,
    owner: 'IT/SharePoint Admin Team',
    notes: 'Not yet started.'
  },
  {
    id: 'SE-DOC-04', appId: '3', sectionKey: '04-power-automate-flows', sectionNumber: '04', sectionTitle: 'Power Automate Flows',
    status: DocumentationStatus.Missing,
    owner: 'IT/SharePoint Admin Team',
    notes: 'Script Approval Workflow not yet documented.'
  },
  {
    id: 'SE-DOC-05', appId: '3', sectionKey: '05-security', sectionNumber: '05', sectionTitle: 'Security',
    status: DocumentationStatus.Missing,
    owner: 'Security Team',
    notes: 'Blocking item – must be completed before GA.'
  },
  {
    id: 'SE-DOC-06', appId: '3', sectionKey: '06-deployment-guide', sectionNumber: '06', sectionTitle: 'Deployment Guide',
    status: DocumentationStatus.Missing,
    owner: 'IT/SharePoint Admin Team',
    notes: 'Not yet started.'
  },
  {
    id: 'SE-DOC-07', appId: '3', sectionKey: '07-user-guide', sectionNumber: '07', sectionTitle: 'User Guide',
    status: DocumentationStatus.Missing,
    owner: 'IT/SharePoint Admin Team',
    notes: 'Not yet started.'
  },
  {
    id: 'SE-DOC-08', appId: '3', sectionKey: '08-admin-guide', sectionNumber: '08', sectionTitle: 'Admin Guide',
    status: DocumentationStatus.Missing,
    owner: 'IT/SharePoint Admin Team',
    notes: 'Not yet started.'
  },
  {
    id: 'SE-DOC-09', appId: '3', sectionKey: '09-roadmap', sectionNumber: '09', sectionTitle: 'Roadmap',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/ScriptElixir/09-Roadmap-DRAFT.docx`,
    lastUpdated: '2024-04-10', owner: 'IT/SharePoint Admin Team'
  },
  {
    id: 'SE-DOC-10', appId: '3', sectionKey: '10-appendices', sectionNumber: '10', sectionTitle: 'Appendices',
    status: DocumentationStatus.Missing,
    owner: 'IT/SharePoint Admin Team',
    notes: 'Not yet started.'
  },

  // ── Tech Elixir Solution Center ───────────────────────────────────────────
  {
    id: 'TESC-DOC-00', appId: '4', sectionKey: '00-overview', sectionNumber: '00', sectionTitle: 'Overview',
    status: DocumentationStatus.Current,
    url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/blob/main/README.md',
    lastUpdated: '2024-04-15', owner: 'Tech Elixir Core Team'
  },
  {
    id: 'TESC-DOC-01', appId: '4', sectionKey: '01-architecture', sectionNumber: '01', sectionTitle: 'Architecture',
    status: DocumentationStatus.Current,
    url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/blob/main/README.md',
    lastUpdated: '2024-04-15', owner: 'Tech Elixir Core Team',
    notes: 'Architecture documented in README; standalone doc planned.'
  },
  {
    id: 'TESC-DOC-02', appId: '4', sectionKey: '02-data-model', sectionNumber: '02', sectionTitle: 'Data Model',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/TESC/02-Data-Model-DRAFT.docx`,
    lastUpdated: '2024-04-10', owner: 'Tech Elixir Core Team',
    notes: 'IApplication interface and SharePoint list columns documented; needs diagram.'
  },
  {
    id: 'TESC-DOC-03', appId: '4', sectionKey: '03-screen-catalogue', sectionNumber: '03', sectionTitle: 'Screen Catalogue',
    status: DocumentationStatus.Missing,
    owner: 'Tech Elixir Core Team',
    notes: 'Component inventory not yet formalized.'
  },
  {
    id: 'TESC-DOC-04', appId: '4', sectionKey: '04-power-automate-flows', sectionNumber: '04', sectionTitle: 'Power Automate Flows',
    status: DocumentationStatus.Missing,
    owner: 'Tech Elixir Core Team',
    notes: 'No Power Automate flows in scope for v1.0.'
  },
  {
    id: 'TESC-DOC-05', appId: '4', sectionKey: '05-security', sectionNumber: '05', sectionTitle: 'Security',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/TESC/05-Security-DRAFT.docx`,
    lastUpdated: '2024-04-12', owner: 'Security Team',
    notes: 'Read-only dashboard; data classification in progress.'
  },
  {
    id: 'TESC-DOC-06', appId: '4', sectionKey: '06-deployment-guide', sectionNumber: '06', sectionTitle: 'Deployment Guide',
    status: DocumentationStatus.Approved,
    url: `${SP_BASE}/TESC/06-Deployment-Guide.docx`,
    lastUpdated: '2024-04-15', owner: 'Tech Elixir Core Team'
  },
  {
    id: 'TESC-DOC-07', appId: '4', sectionKey: '07-user-guide', sectionNumber: '07', sectionTitle: 'User Guide',
    status: DocumentationStatus.Missing,
    owner: 'Tech Elixir Core Team',
    notes: 'End-user guide not yet started.'
  },
  {
    id: 'TESC-DOC-08', appId: '4', sectionKey: '08-admin-guide', sectionNumber: '08', sectionTitle: 'Admin Guide',
    status: DocumentationStatus.Draft,
    url: `${SP_BASE}/TESC/08-Admin-Guide-DRAFT.docx`,
    lastUpdated: '2024-04-14', owner: 'Tech Elixir Core Team'
  },
  {
    id: 'TESC-DOC-09', appId: '4', sectionKey: '09-roadmap', sectionNumber: '09', sectionTitle: 'Roadmap',
    status: DocumentationStatus.Current,
    url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/projects',
    lastUpdated: '2024-04-15', owner: 'Tech Elixir Core Team'
  },
  {
    id: 'TESC-DOC-10', appId: '4', sectionKey: '10-appendices', sectionNumber: '10', sectionTitle: 'Appendices',
    status: DocumentationStatus.Missing,
    owner: 'Tech Elixir Core Team',
    notes: 'Not yet started.'
  }
];

// ---------------------------------------------------------------------------
// Integrations – external systems each app depends on
// ---------------------------------------------------------------------------

export const MOCK_INTEGRATIONS: IIntegration[] = [
  // ── Finance Elixir ────────────────────────────────────────────────────────
  {
    id: 'FE-INT-001', appId: '1', name: 'Finance SharePoint Site',
    systemType: 'SharePoint', direction: 'Bidirectional', authenticationType: 'OAuth 2.0',
    dataClassification: 'Internal', environment: Environment.Production, status: 'Active',
    url: 'https://your-sharepoint-site/sites/FinanceElixir',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/Architecture.docx',
    notes: 'Primary SharePoint site collection hosting Finance Elixir lists and pages.',
    owner: 'Finance Team'
  },
  {
    id: 'FE-INT-002', appId: '1', name: 'Finance Power BI Workspace',
    systemType: 'External API', direction: 'Inbound', authenticationType: 'Service Principal',
    dataClassification: 'Confidential', environment: Environment.Production, status: 'Active',
    url: 'https://app.powerbi.com/groups/me/reports/finance-elixir',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/DataFlow.vsdx',
    notes: 'Power BI workspace with embedded financial dashboards and reports.',
    owner: 'Finance Team'
  },
  {
    id: 'FE-INT-003', appId: '1', name: 'Budget Approval Power Automate Flow',
    systemType: 'Power Automate', direction: 'Bidirectional', authenticationType: 'OAuth 2.0',
    dataClassification: 'Confidential', environment: Environment.Production, status: 'Degraded',
    url: 'https://make.powerautomate.com/environments/default/flows/budget-approval-flow',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/FlowDocs.md',
    notes: 'Multi-level budget approval flow under review for Q2 approval threshold changes.',
    owner: 'Finance Team'
  },
  {
    id: 'FE-INT-004', appId: '1', name: 'Expense Tracker Dataverse',
    systemType: 'Dataverse', direction: 'Bidirectional', authenticationType: 'OAuth 2.0',
    dataClassification: 'Confidential', environment: Environment.Production, status: 'Active',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/DataModel.md',
    notes: 'Dataverse table storing employee expense records.',
    owner: 'Finance Team'
  },
  {
    id: 'FE-INT-005', appId: '1', name: 'Microsoft Teams Finance Channel',
    systemType: 'External API', direction: 'Outbound', authenticationType: 'OAuth 2.0',
    dataClassification: 'Internal', environment: Environment.Production, status: 'Active',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/Notifications.md',
    notes: 'Teams channel integration for approval notifications.',
    owner: 'Finance Team'
  },

  // ── Fitness Elixir ────────────────────────────────────────────────────────
  {
    id: 'FIT-INT-001', appId: '2', name: 'Wellness SharePoint Site',
    systemType: 'SharePoint', direction: 'Bidirectional', authenticationType: 'OAuth 2.0',
    dataClassification: 'Confidential', environment: Environment.Production, status: 'Active',
    url: 'https://your-sharepoint-site/sites/FitnessElixir',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/Architecture.docx',
    notes: 'SharePoint site hosting Fitness Elixir activity lists and leaderboard web part.',
    owner: 'HR & Wellness Team'
  },
  {
    id: 'FIT-INT-002', appId: '2', name: 'Fitness Activity Logger Power App',
    systemType: 'Power Apps', direction: 'Inbound', authenticationType: 'OAuth 2.0',
    dataClassification: 'Confidential', environment: Environment.Production, status: 'Active',
    url: 'https://make.powerapps.com/environments/default/apps/fitness-logger',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/UserGuide.pdf',
    notes: 'Canvas app allowing employees to log daily fitness activities.',
    owner: 'HR & Wellness Team'
  },
  {
    id: 'FIT-INT-003', appId: '2', name: 'Challenge Notification Flow',
    systemType: 'Power Automate', direction: 'Outbound', authenticationType: 'OAuth 2.0',
    dataClassification: 'Internal', environment: Environment.Production, status: 'Degraded',
    url: 'https://make.powerautomate.com/environments/default/flows/challenge-notification',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/FlowInventory.md',
    notes: 'Weekly challenge reminders and leaderboard updates via Teams; occasional delays reported.',
    owner: 'HR & Wellness Team'
  },
  {
    id: 'FIT-INT-004', appId: '2', name: 'Microsoft Teams Wellness Channel',
    systemType: 'External API', direction: 'Outbound', authenticationType: 'OAuth 2.0',
    dataClassification: 'Internal', environment: Environment.Production, status: 'Active',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/CommsGuide.md',
    notes: 'Teams channel used for challenge announcements and wellness tips.',
    owner: 'HR & Wellness Team'
  },

  // ── Script Elixir ─────────────────────────────────────────────────────────
  {
    id: 'SE-INT-001', appId: '3', name: 'Script Catalog SharePoint Site',
    systemType: 'SharePoint', direction: 'Bidirectional', authenticationType: 'OAuth 2.0',
    dataClassification: 'Internal', environment: Environment.Development, status: 'Degraded',
    url: 'https://your-sharepoint-site/sites/ScriptElixir-Dev',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/ScriptElixir/ArchitectureDraft.docx',
    notes: 'Dev site hosting the script catalog list; not yet promoted to production.',
    owner: 'IT/SharePoint Admin Team'
  },
  {
    id: 'SE-INT-002', appId: '3', name: 'Microsoft Graph API',
    systemType: 'Microsoft Graph', direction: 'Bidirectional', authenticationType: 'Service Principal',
    dataClassification: 'Internal', environment: Environment.Development, status: 'Planned',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/ScriptElixir/GraphIntegration.md',
    notes: 'Used for profile lookups and script permissions; integration not yet finalized.',
    owner: 'IT/SharePoint Admin Team'
  },
  {
    id: 'SE-INT-003', appId: '3', name: 'Script Approval Power Automate Flow',
    systemType: 'Power Automate', direction: 'Bidirectional', authenticationType: 'OAuth 2.0',
    dataClassification: 'Internal', environment: Environment.Development, status: 'Inactive',
    documentationUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/ScriptElixir/FlowDesign.md',
    notes: 'Script peer-review approval flow currently broken; awaiting SharePoint permissions fix.',
    owner: 'IT/SharePoint Admin Team'
  },
  {
    id: 'SE-INT-004', appId: '3', name: 'GitHub Script Elixir Repository',
    systemType: 'GitHub', direction: 'Inbound', authenticationType: 'OAuth 2.0',
    dataClassification: 'Public', environment: Environment.Development, status: 'Active',
    url: 'https://github.com/lvs-jlouth/script-elixir',
    documentationUrl: 'https://github.com/lvs-jlouth/script-elixir/wiki',
    notes: 'Source control and PR workflow for script catalog source code.',
    owner: 'IT/SharePoint Admin Team'
  },

  // ── Tech Elixir Solution Center ───────────────────────────────────────────
  {
    id: 'TESC-INT-001', appId: '4', name: 'TechElixir SharePoint Site',
    systemType: 'SharePoint', direction: 'Bidirectional', authenticationType: 'OAuth 2.0',
    dataClassification: 'Internal', environment: Environment.Production, status: 'Active',
    url: 'https://your-sharepoint-site/sites/TechElixir',
    documentationUrl: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/blob/main/README.md',
    notes: 'Host SharePoint site for the Solution Center web part.',
    owner: 'Tech Elixir Core Team'
  },
  {
    id: 'TESC-INT-002', appId: '4', name: 'GitHub Tech-Elixir-Solution-Center Repository',
    systemType: 'GitHub', direction: 'Inbound', authenticationType: 'OAuth 2.0',
    dataClassification: 'Public', environment: Environment.Production, status: 'Active',
    url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center',
    documentationUrl: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/wiki',
    notes: 'Source control, CI/CD, and issue tracking for the Solution Center.',
    owner: 'Tech Elixir Core Team'
  }
];

// ---------------------------------------------------------------------------
// Health summaries – one per application
// ---------------------------------------------------------------------------

export const MOCK_HEALTH_SUMMARIES: IHealthSummary[] = [
  {
    appId: '1',
    overall: HealthStatus.Green,
    documentation: HealthStatus.Yellow,
    accessibility: HealthStatus.Yellow,
    security: HealthStatus.Yellow,
    lastAssessed: '2024-04-10',
    notes: 'Application is active and well-documented. Security review in progress. Two accessibility items need remediation.'
  },
  {
    appId: '2',
    overall: HealthStatus.Yellow,
    documentation: HealthStatus.Yellow,
    accessibility: HealthStatus.Red,
    security: HealthStatus.Red,
    lastAssessed: '2024-04-05',
    notes: 'Documentation coverage at 55%. Critical accessibility contrast failure. Security documentation not started despite handling potentially sensitive wellness data.'
  },
  {
    appId: '3',
    overall: HealthStatus.Red,
    documentation: HealthStatus.Red,
    accessibility: HealthStatus.Unknown,
    security: HealthStatus.Red,
    lastAssessed: '2024-04-08',
    notes: 'In development. Two critical tech debt items (testing and security model) block production release. Documentation at 35% and accessibility not yet reviewed.'
  },
  {
    appId: '4',
    overall: HealthStatus.Yellow,
    documentation: HealthStatus.Yellow,
    accessibility: HealthStatus.Green,
    security: HealthStatus.Yellow,
    lastAssessed: '2024-04-15',
    notes: 'Read-only dashboard in active development. Core accessibility passing. Documentation at 60%. Security data classification in progress.'
  }
];

// ---------------------------------------------------------------------------
// Typed lookup helpers used by MockDataService
// ---------------------------------------------------------------------------

/** Returns documents for a given application id. */
export function getDocumentsForApp(appId: string): IDocument[] {
  return MOCK_DOCUMENTS.filter(d => d.appId === appId);
}

/** Returns integrations for a given application id. */
export function getIntegrationsForApp(appId: string): IIntegration[] {
  return MOCK_INTEGRATIONS.filter(i => i.appId === appId);
}

/** Returns the health summary for a given application id, or undefined. */
export function getHealthSummaryForApp(appId: string): IHealthSummary | undefined {
  return MOCK_HEALTH_SUMMARIES.find(h => h.appId === appId);
}

/** Returns architecture docs for a given application id. */
export function getArchitectureAssetsForApp(appId: string): IArchitectureDoc[] {
  const app = MOCK_APPLICATIONS.find(a => a.id === appId);
  return app ? app.architectureDocs : [];
}

/** Returns release notes for a given application id. */
export function getReleaseNotesForApp(appId: string): IReleaseNote[] {
  const app = MOCK_APPLICATIONS.find(a => a.id === appId);
  return app ? app.releaseNotes : [];
}

/** Returns technical debt items for a given application id. */
export function getTechnicalDebtForApp(appId: string): ITechnicalDebtItem[] {
  const app = MOCK_APPLICATIONS.find(a => a.id === appId);
  return app ? app.technicalDebt : [];
}

/** Returns accessibility items for a given application id. */
export function getAccessibilityItemsForApp(appId: string): IAccessibilityItem[] {
  const app = MOCK_APPLICATIONS.find(a => a.id === appId);
  return app ? app.accessibilityItems : [];
}
