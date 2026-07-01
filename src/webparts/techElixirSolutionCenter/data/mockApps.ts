import { IApplication } from '../models';

export const mockApps: IApplication[] = [
  {
    id: '1',
    name: 'Finance Elixir',
    description: 'A SharePoint-based financial management and reporting application that streamlines budget tracking, expense approvals, and financial dashboards for the organization.',
    status: 'Active',
    owner: 'Finance Team',
    docCompleteness: 78,
    tags: ['Finance', 'SharePoint', 'Power BI', 'Reporting'],
    githubRepoUrl: 'https://github.com/lvs-jlouth/finance-elixir',
    architectureDocs: [
      {
        title: 'Finance Elixir – Solution Architecture',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/Architecture.docx',
        description: 'High-level solution architecture covering SharePoint lists, Power BI integration, and Power Automate flows.',
        lastUpdated: '2024-03-15'
      },
      {
        title: 'Data Flow Diagram',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/DataFlow.vsdx',
        description: 'Data flow between SharePoint, Dataverse, and Power BI.',
        lastUpdated: '2024-02-20'
      }
    ],
    releaseNotes: [
      {
        version: '2.1.0',
        date: '2024-04-01',
        releaseType: 'Minor',
        summary: 'Added Power BI embedded reports and improved budget approval workflow.',
        documentationChanges: [
          'Updated architecture documentation for Power BI embedding flow',
          'Revised budget approval runbook with multi-level escalation steps'
        ],
        githubReleaseUrl: 'https://github.com/lvs-jlouth/finance-elixir/releases/tag/v2.1.0',
        deploymentStatus: 'Deployed',
        releaseOwner: 'Finance Team',
        knownIssues: [
          'Budget export can be slow for datasets over 20,000 records'
        ],
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
        releaseType: 'Major',
        summary: 'Major redesign with Fluent UI v8 components and PnPjs v3.',
        documentationChanges: [
          'Published migration guide for Fluent UI v8 controls',
          'Added release notes for role-based report visibility'
        ],
        githubReleaseUrl: 'https://github.com/lvs-jlouth/finance-elixir/releases/tag/v2.0.0',
        deploymentStatus: 'Deployed',
        releaseOwner: 'Finance Team',
        knownIssues: [
          'Legacy browser support for CSV export formatting remains limited'
        ],
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
        description: 'The web part was originally built on SPFx 1.15. Upgrading to 1.18.2 would bring Viva Connections support and improved build tooling.',
        severity: 'Medium',
        status: 'Open',
        createdDate: '2024-01-10'
      },
      {
        id: 'FE-TD-002',
        title: 'Replace hardcoded SharePoint site URL',
        description: 'Several components reference a hardcoded site URL instead of using context.pageContext.site.absoluteUrl.',
        severity: 'High',
        status: 'InProgress',
        createdDate: '2024-02-05'
      },
      {
        id: 'FE-TD-003',
        title: 'Add unit tests for AppDataService',
        description: 'The data service layer has zero test coverage. Jest tests should be added.',
        severity: 'Low',
        status: 'Open',
        createdDate: '2024-03-01'
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
        notes: 'Budget status indicators rely solely on red/green color. Add icon or label.'
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
      { label: 'Architecture Doc', url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/Architecture.docx', iconName: 'Documentation' },
      { label: 'GitHub Repo', url: 'https://github.com/lvs-jlouth/finance-elixir', iconName: 'CodeEdit' },
      { label: 'Power BI Report', url: 'https://app.powerbi.com/groups/me/reports/finance-elixir', iconName: 'BarChart4' },
      { label: 'Release Notes', url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/ReleaseNotes.md', iconName: 'ReleaseGate' },
      { label: 'Test Plan', url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/TestPlan.xlsx', iconName: 'TestPlan' }
    ]
  },
  {
    id: '2',
    name: 'Fitness Elixir',
    description: 'An employee wellness and fitness tracking application built on SharePoint and Power Platform, enabling staff to log activities, join challenges, and track team wellness goals.',
    status: 'Active',
    owner: 'HR & Wellness Team',
    docCompleteness: 55,
    tags: ['Wellness', 'SharePoint', 'Power Apps', 'Gamification'],
    githubRepoUrl: 'https://github.com/lvs-jlouth/fitness-elixir',
    architectureDocs: [
      {
        title: 'Fitness Elixir – Architecture Overview',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/Architecture.docx',
        description: 'System design covering Power Apps, SharePoint lists, and gamification logic.',
        lastUpdated: '2024-02-10'
      }
    ],
    releaseNotes: [
      {
        version: '1.3.0',
        date: '2024-03-20',
        releaseType: 'Minor',
        summary: 'Team challenge features and improved leaderboard.',
        documentationChanges: [
          'Extended user guide with team challenge configuration',
          'Added leaderboard scoring logic to operations notes'
        ],
        githubReleaseUrl: 'https://github.com/lvs-jlouth/fitness-elixir/releases/tag/v1.3.0',
        deploymentStatus: 'Deployed',
        releaseOwner: 'HR & Wellness Team',
        knownIssues: [
          'Leaderboard refresh may lag by up to 5 minutes after activity submission'
        ],
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
        releaseType: 'Minor',
        summary: 'Power Apps integration and mobile improvements.',
        documentationChanges: [
          'Added mobile usage guide for Fitness Power App',
          'Documented SharePoint-to-Power Automate sync configuration'
        ],
        githubReleaseUrl: 'https://github.com/lvs-jlouth/fitness-elixir/releases/tag/v1.2.0',
        deploymentStatus: 'Deployed',
        releaseOwner: 'HR & Wellness Team',
        knownIssues: [
          'Older iOS devices may require a manual refresh after first login'
        ],
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
        description: 'Sends weekly challenge reminders and leaderboard updates via Teams.'
      }
    ],
    technicalDebt: [
      {
        id: 'FIT-TD-001',
        title: 'Documentation coverage below 60%',
        description: 'Architecture documentation, API reference, and user guide are incomplete.',
        severity: 'High',
        status: 'Open',
        createdDate: '2024-01-20'
      },
      {
        id: 'FIT-TD-002',
        title: 'Leaderboard calculation is O(n²)',
        description: 'The leaderboard ranking algorithm iterates over all records for each user. Needs optimization for orgs with 500+ users.',
        severity: 'Medium',
        status: 'Open',
        createdDate: '2024-03-10'
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
        notes: 'Leaderboard rank numbers use light gray text on white background (contrast ratio 2.5:1, needs 4.5:1).'
      },
      {
        id: 'FIT-A11Y-003',
        requirement: 'Focus is visible for all interactive elements',
        wcagCriteria: '2.4.7 Focus Visible (AA)',
        status: 'NeedsReview',
        notes: 'Challenge cards may suppress default focus ring in some browser/theme combos.'
      }
    ],
    securityStatus: {
      threatModelComplete: 'NotStarted',
      dataClassificationComplete: 'InProgress',
      securityReviewComplete: 'NotStarted',
      privacyImpactAssessment: 'InProgress',
      notes: 'PIA in progress - wellness data may include sensitive health information.'
    },
    quickLinks: [
      { label: 'Architecture Doc', url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/Architecture.docx', iconName: 'Documentation' },
      { label: 'GitHub Repo', url: 'https://github.com/lvs-jlouth/fitness-elixir', iconName: 'CodeEdit' },
      { label: 'Power App', url: 'https://make.powerapps.com/environments/default/apps/fitness-logger', iconName: 'PowerApps' },
      { label: 'User Guide', url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/UserGuide.pdf', iconName: 'BookAnswers' }
    ]
  },
  {
    id: '3',
    name: 'Script Elixir',
    description: 'A centralized script library and automation hub for SharePoint administrators, allowing teams to discover, share, and execute PnP PowerShell, SPFx, and Graph API scripts through a governed SharePoint interface.',
    status: 'InDevelopment',
    owner: 'IT/SharePoint Admin Team',
    docCompleteness: 35,
    tags: ['Automation', 'PowerShell', 'PnP', 'Graph API', 'Admin'],
    githubRepoUrl: 'https://github.com/lvs-jlouth/script-elixir',
    architectureDocs: [
      {
        title: 'Script Elixir – Draft Architecture',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/ScriptElixir/ArchitectureDraft.docx',
        description: 'Initial architecture draft for the script library system.',
        lastUpdated: '2024-04-05'
      }
    ],
    releaseNotes: [
      {
        version: '0.2.0-beta',
        date: '2024-04-10',
        releaseType: 'Beta',
        summary: 'Beta release of script catalog and search functionality.',
        documentationChanges: [
          'Published beta rollout checklist for script submission',
          'Added initial governance notes for script approval'
        ],
        githubReleaseUrl: 'https://github.com/lvs-jlouth/script-elixir/releases/tag/v0.2.0-beta',
        deploymentStatus: 'InProgress',
        releaseOwner: 'IT/SharePoint Admin Team',
        knownIssues: [
          'Script execution wrapper does not yet support parallel runs',
          'Search index must be manually refreshed after bulk uploads'
        ],
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
        description: 'Peer-review approval flow before new scripts are published to the catalog.'
      }
    ],
    technicalDebt: [
      {
        id: 'SE-TD-001',
        title: 'No automated tests',
        description: 'Zero test coverage across all components. Needs Jest unit tests and integration tests.',
        severity: 'Critical',
        status: 'Open',
        createdDate: '2024-03-15'
      },
      {
        id: 'SE-TD-002',
        title: 'Script execution security model undefined',
        description: 'The mechanism for safely executing scripts needs a formal security review and sandboxing approach.',
        severity: 'Critical',
        status: 'Open',
        createdDate: '2024-03-15'
      },
      {
        id: 'SE-TD-003',
        title: 'Architecture documentation incomplete',
        description: 'Only a draft architecture document exists; full solution design not yet documented.',
        severity: 'High',
        status: 'Open',
        createdDate: '2024-04-01'
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
      notes: 'Security documentation not yet started. Must be completed before GA release.'
    },
    quickLinks: [
      { label: 'Architecture Draft', url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/ScriptElixir/ArchitectureDraft.docx', iconName: 'Documentation' },
      { label: 'GitHub Repo', url: 'https://github.com/lvs-jlouth/script-elixir', iconName: 'CodeEdit' },
      { label: 'Project Board', url: 'https://github.com/lvs-jlouth/script-elixir/projects', iconName: 'ProjectLogo32' }
    ]
  },
  {
    id: '4',
    name: 'Tech Elixir Solution Center',
    description: 'This web part itself — a living documentation and application engineering dashboard for all Tech Elixir SharePoint-based app builds.',
    status: 'InDevelopment',
    owner: 'Tech Elixir Core Team',
    docCompleteness: 60,
    tags: ['SPFx', 'React', 'TypeScript', 'Fluent UI', 'PnPjs'],
    githubRepoUrl: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center',
    architectureDocs: [
      {
        title: 'Solution Center – Architecture',
        url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/blob/main/README.md',
        description: 'README with architecture overview, component structure, and setup guide.',
        lastUpdated: '2024-04-15'
      }
    ],
    releaseNotes: [
      {
        version: '1.0.0',
        date: '2024-04-15',
        releaseType: 'GeneralAvailability',
        summary: 'Initial release with full dashboard structure.',
        documentationChanges: [
          'Published initial solution architecture and setup guide in README',
          'Added component catalog and mock data structure notes'
        ],
        githubReleaseUrl: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/releases/tag/v1.0.0',
        deploymentStatus: 'Deployed',
        releaseOwner: 'Tech Elixir Core Team',
        knownIssues: [
          'Some security and accessibility statuses are still pending review'
        ],
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
        description: 'AppDataService currently falls back to mock data when list is empty. Needs full list-to-model mapping.',
        severity: 'Medium',
        status: 'Open',
        createdDate: '2024-04-15'
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
      { label: 'GitHub Repo', url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center', iconName: 'CodeEdit' },
      { label: 'README', url: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/blob/main/README.md', iconName: 'Documentation' }
    ]
  }
];
