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
        assetType: 'Word document',
        description: 'High-level solution architecture covering SharePoint lists, Power BI integration, and Power Automate flows.',
        version: 'v2.1',
        lastUpdated: '2024-03-15',
        owner: 'Finance Team',
        previewAvailable: false,
        category: 'Current State'
      },
      {
        title: 'Data Flow Diagram',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/DataFlow.vsdx',
        assetType: 'VSDX',
        description: 'Data flow between SharePoint, Dataverse, and Power BI.',
        version: 'v1.4',
        lastUpdated: '2024-02-20',
        owner: 'Data Engineering Team',
        previewAvailable: false,
        category: 'Data Flow'
      },
      {
        title: 'Security Trust Boundaries',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/SecurityModel.pdf',
        assetType: 'PDF',
        description: 'Trust boundaries, access model, and encryption standards.',
        version: 'v1.2',
        lastUpdated: '2024-03-18',
        owner: 'Security Team',
        previewAvailable: false,
        category: 'Security'
      },
      {
        title: 'Deployment Topology',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/DeploymentTopology.drawio',
        assetType: 'Draw.io',
        description: 'Deployment topology for production and disaster recovery environments.',
        version: 'v1.0',
        lastUpdated: '2024-03-05',
        owner: 'Platform Engineering',
        previewAvailable: false,
        category: 'Deployment'
      },
      {
        title: 'Power Platform Integration Map',
        url: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/PowerPlatformMap.png',
        assetType: 'PNG',
        description: 'Visual map of Power Apps, Power Automate, and Dataverse integration points.',
        version: 'v1.6',
        lastUpdated: '2024-03-22',
        owner: 'Power Platform Team',
        previewAvailable: true,
        previewUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/PowerPlatformMap.png',
        category: 'Power Platform'
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
        category: 'DevOps',
        severity: 'Medium',
        impact: 'Continued use of older toolchain increases maintenance overhead and limits compatibility with newer SPFx capabilities.',
        suggestedRemediation: 'Plan and execute an SPFx framework upgrade, then run full regression validation in development and production environments.',
        owner: 'Tech Elixir Core Team',
        targetRelease: 'v2.2.0',
        status: 'Open',
        createdDate: '2024-01-10',
        lastUpdatedDate: '2024-04-18'
      },
      {
        id: 'FE-TD-002',
        title: 'Replace hardcoded SharePoint site URL',
        description: 'Several components reference a hardcoded site URL instead of using context.pageContext.site.absoluteUrl.',
        category: 'SharePoint',
        severity: 'High',
        impact: 'Hardcoded URLs can break deployments across tenants and environments, causing runtime failures and broken links.',
        suggestedRemediation: 'Refactor all URL references to derive the base site URL from SharePoint context and centralize URL composition.',
        owner: 'Finance Team',
        targetRelease: 'v2.1.1',
        status: 'InProgress',
        createdDate: '2024-02-05',
        lastUpdatedDate: '2024-04-16'
      },
      {
        id: 'FE-TD-003',
        title: 'Add unit tests for AppDataService',
        description: 'The data service layer has zero test coverage. Jest tests should be added.',
        category: 'Maintainability',
        severity: 'Low',
        impact: 'Lack of automated tests makes future refactors riskier and slows delivery confidence.',
        suggestedRemediation: 'Add Jest unit tests for list mapping, fallback behavior, and error handling in AppDataService.',
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
    accessibilityChecks: [
      {
        id: 'FE-CHK-001',
        requirement: 'All images have descriptive alt text',
        wcagReference: '1.1.1 Non-text Content (A)',
        status: 'Pass',
        impactArea: 'Visual',
        notes: 'All chart images include aria-label attributes.',
        remediationGuidance: 'No action required.',
        owner: 'Finance Team',
        targetDate: '2024-04-01',
        relatedDocumentUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/A11Y-Report.docx'
      },
      {
        id: 'FE-CHK-002',
        requirement: 'Color is not the only means of conveying budget status',
        wcagReference: '1.4.1 Use of Color (A)',
        status: 'NeedsAttention',
        impactArea: 'Color Contrast',
        notes: 'Budget status indicators rely solely on red/green color. Users with color blindness cannot distinguish states.',
        remediationGuidance: 'Add a text label or icon (e.g., "Over budget" / warning icon) alongside the color indicator on the budget dashboard.',
        owner: 'Finance Team',
        targetDate: '2024-06-30',
        relatedDocumentUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/ColorContrast-Audit.docx'
      },
      {
        id: 'FE-CHK-003',
        requirement: 'Keyboard navigation works for all interactive elements',
        wcagReference: '2.1.1 Keyboard (A)',
        status: 'Pass',
        impactArea: 'Keyboard Navigation',
        notes: 'All buttons, links, and dropdowns are keyboard accessible.',
        remediationGuidance: 'No action required.',
        owner: 'Finance Team',
        targetDate: '2024-04-01'
      },
      {
        id: 'FE-CHK-004',
        requirement: 'Expense date picker field has an accessible label',
        wcagReference: '1.3.1 Info and Relationships (A)',
        status: 'Blocked',
        impactArea: 'Screen Reader',
        notes: 'Expense date picker field is missing an aria-label. Screen reader users cannot identify the field.',
        remediationGuidance: 'Add aria-label="Expense date" to the date picker input element. Awaiting third-party component update to support label injection.',
        owner: 'Finance Team',
        targetDate: '2024-07-15',
        relatedDocumentUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FinanceElixir/A11Y-Report.docx'
      },
      {
        id: 'FE-CHK-005',
        requirement: 'Text contrast ratio meets WCAG AA minimum (4.5:1)',
        wcagReference: '1.4.3 Contrast Minimum (AA)',
        status: 'Pass',
        impactArea: 'Color Contrast',
        notes: 'All body text verified at minimum 4.5:1 contrast ratio against backgrounds.',
        remediationGuidance: 'No action required.',
        owner: 'Finance Team',
        targetDate: '2024-04-01'
      },
      {
        id: 'FE-CHK-006',
        requirement: 'Animated loading indicators respect prefers-reduced-motion',
        wcagReference: '2.3.3 Animation from Interactions (AAA)',
        status: 'NotReviewed',
        impactArea: 'Motion Sensitivity',
        notes: 'Loading spinners have not been reviewed against prefers-reduced-motion media query.',
        remediationGuidance: 'Add @media (prefers-reduced-motion: reduce) CSS rule to disable or slow animations. Review all spinner and transition components.',
        owner: 'Finance Team',
        targetDate: '2024-08-01'
      },
      {
        id: 'FE-CHK-007',
        requirement: 'Export report button is announced correctly by screen readers',
        wcagReference: '4.1.2 Name, Role, Value (A)',
        status: 'Pass',
        impactArea: 'Screen Reader',
        notes: 'Export button has a clear accessible name and role.',
        remediationGuidance: 'No action required.',
        owner: 'Finance Team',
        targetDate: '2024-04-01'
      },
      {
        id: 'FE-CHK-008',
        requirement: 'Error messages are programmatically associated with form fields',
        wcagReference: '3.3.1 Error Identification (A)',
        status: 'NeedsAttention',
        impactArea: 'Cognitive',
        notes: 'Budget submission form error messages appear visually but are not linked to fields via aria-describedby.',
        remediationGuidance: 'Add aria-describedby on each input referencing its error message element ID. Ensure error messages are included in the accessible description.',
        owner: 'Finance Team',
        targetDate: '2024-06-15'
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
        assetType: 'Word document',
        description: 'System design covering Power Apps, SharePoint lists, and gamification logic.',
        version: 'v1.3',
        lastUpdated: '2024-02-10',
        owner: 'HR & Wellness Team',
        previewAvailable: false,
        category: 'Future State'
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
        category: 'Documentation',
        severity: 'High',
        impact: 'Incomplete documentation increases onboarding time and raises support effort for operations and enhancements.',
        suggestedRemediation: 'Complete architecture, API, and user documentation and enforce doc updates in release readiness checks.',
        owner: 'HR & Wellness Team',
        targetRelease: 'v1.4.0',
        status: 'Open',
        createdDate: '2024-01-20',
        lastUpdatedDate: '2024-04-11'
      },
      {
        id: 'FIT-TD-002',
        title: 'Leaderboard calculation is O(n²)',
        description: 'The leaderboard ranking algorithm iterates over all records for each user. Needs optimization for orgs with 500+ users.',
        category: 'Performance',
        severity: 'Medium',
        impact: 'Performance degrades as participant counts grow, causing slow page loads and delayed ranking updates.',
        suggestedRemediation: 'Replace nested iteration with a grouped aggregation approach and cache computed rankings.',
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
    accessibilityChecks: [
      {
        id: 'FIT-CHK-001',
        requirement: 'All images have descriptive alt text',
        wcagReference: '1.1.1 Non-text Content (A)',
        status: 'Pass',
        impactArea: 'Visual',
        notes: 'Activity badge images include alt text describing the badge type.',
        remediationGuidance: 'No action required.',
        owner: 'HR & Wellness Team',
        targetDate: '2024-03-20'
      },
      {
        id: 'FIT-CHK-002',
        requirement: 'Leaderboard rank text meets minimum color contrast (4.5:1)',
        wcagReference: '1.4.3 Contrast Minimum (AA)',
        status: 'Blocked',
        impactArea: 'Color Contrast',
        notes: 'Rank numbers use light gray text on white background (contrast ratio 2.5:1). Waiting on design team approval to update color tokens.',
        remediationGuidance: 'Change rank number color to #595959 or darker to achieve 4.5:1 ratio on white background. Update the design token in the shared styles file.',
        owner: 'HR & Wellness Team',
        targetDate: '2024-07-01',
        relatedDocumentUrl: 'https://your-sharepoint-site/sites/TechElixir/Shared%20Documents/FitnessElixir/A11Y-ColorAudit.xlsx'
      },
      {
        id: 'FIT-CHK-003',
        requirement: 'Focus indicator is visible on challenge cards',
        wcagReference: '2.4.7 Focus Visible (AA)',
        status: 'NeedsAttention',
        impactArea: 'Keyboard Navigation',
        notes: 'Challenge cards suppress the default browser focus ring via outline:none CSS. Keyboard-only users cannot see current focus position.',
        remediationGuidance: 'Replace outline:none with a custom focus style (e.g., outline: 2px solid #0078d4). Test in high-contrast mode and across supported browsers.',
        owner: 'HR & Wellness Team',
        targetDate: '2024-06-01'
      },
      {
        id: 'FIT-CHK-004',
        requirement: 'Screen reader announces challenge completion status',
        wcagReference: '4.1.3 Status Messages (AA)',
        status: 'NotReviewed',
        impactArea: 'Screen Reader',
        notes: 'Not yet reviewed. Challenge completion toasts may not be announced by screen readers.',
        remediationGuidance: 'Add role="status" or aria-live="polite" to the completion notification container so screen readers announce the message automatically.',
        owner: 'HR & Wellness Team',
        targetDate: '2024-08-01'
      },
      {
        id: 'FIT-CHK-005',
        requirement: 'Activity log form inputs are keyboard operable',
        wcagReference: '2.1.1 Keyboard (A)',
        status: 'Pass',
        impactArea: 'Mobility',
        notes: 'All form fields in the activity log are operable via keyboard alone.',
        remediationGuidance: 'No action required.',
        owner: 'HR & Wellness Team',
        targetDate: '2024-03-20'
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
        assetType: 'Word document',
        description: 'Initial architecture draft for the script library system.',
        version: 'v0.2',
        lastUpdated: '2024-04-05',
        owner: 'IT/SharePoint Admin Team',
        previewAvailable: false,
        category: 'Integration'
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
        category: 'Maintainability',
        severity: 'Critical',
        impact: 'Without tests, regressions are likely and release risk remains high for every code change.',
        suggestedRemediation: 'Implement baseline unit and integration test suites and include them in CI quality gates.',
        owner: 'IT/SharePoint Admin Team',
        targetRelease: 'v0.3.0',
        status: 'Open',
        createdDate: '2024-03-15',
        lastUpdatedDate: '2024-04-20'
      },
      {
        id: 'SE-TD-002',
        title: 'Script execution security model undefined',
        description: 'The mechanism for safely executing scripts needs a formal security review and sandboxing approach.',
        category: 'Security',
        severity: 'Critical',
        impact: 'Undefined execution controls could expose administrative scripts to misuse or privilege escalation.',
        suggestedRemediation: 'Define and approve a least-privilege execution model with sandboxing, audit logging, and policy enforcement.',
        owner: 'IT/SharePoint Admin Team',
        targetRelease: 'v0.3.0',
        status: 'Open',
        createdDate: '2024-03-15',
        lastUpdatedDate: '2024-04-21'
      },
      {
        id: 'SE-TD-003',
        title: 'Architecture documentation incomplete',
        description: 'Only a draft architecture document exists; full solution design not yet documented.',
        category: 'Architecture',
        severity: 'High',
        impact: 'Incomplete architecture decisions hinder design reviews and delay readiness for broader rollout.',
        suggestedRemediation: 'Publish complete architecture documentation including data flow, trust boundaries, and operational model.',
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
    accessibilityChecks: [
      {
        id: 'SE-CHK-001',
        requirement: 'All images and icons have descriptive alt text',
        wcagReference: '1.1.1 Non-text Content (A)',
        status: 'NotReviewed',
        impactArea: 'Visual',
        notes: 'Application still in development. Not yet reviewed.',
        remediationGuidance: 'Audit all img elements and icon components. Add alt text to all informational images and mark decorative images with alt="".',
        owner: 'IT/SharePoint Admin Team',
        targetDate: '2024-09-01'
      },
      {
        id: 'SE-CHK-002',
        requirement: 'Keyboard navigation works for all interactive elements',
        wcagReference: '2.1.1 Keyboard (A)',
        status: 'NotReviewed',
        impactArea: 'Keyboard Navigation',
        notes: 'Application still in development. Not yet reviewed.',
        remediationGuidance: 'Conduct keyboard-only walkthrough. Ensure tab order is logical and all actions are reachable without a mouse.',
        owner: 'IT/SharePoint Admin Team',
        targetDate: '2024-09-01'
      },
      {
        id: 'SE-CHK-003',
        requirement: 'Script search results are announced to screen readers',
        wcagReference: '4.1.3 Status Messages (AA)',
        status: 'NotReviewed',
        impactArea: 'Screen Reader',
        notes: 'Search result count update on filter has not been tested with screen readers.',
        remediationGuidance: 'Add aria-live="polite" region to announce result count changes when search filters are applied.',
        owner: 'IT/SharePoint Admin Team',
        targetDate: '2024-09-01'
      },
      {
        id: 'SE-CHK-004',
        requirement: 'Script category filter labels are associated with controls',
        wcagReference: '1.3.1 Info and Relationships (A)',
        status: 'NotReviewed',
        impactArea: 'Cognitive',
        notes: 'Filter dropdowns have not been reviewed for proper label association.',
        remediationGuidance: 'Ensure each filter dropdown has an associated <label> element or aria-label. Use Fluent UI Dropdown which includes built-in label support.',
        owner: 'IT/SharePoint Admin Team',
        targetDate: '2024-09-01'
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
        assetType: 'Markdown',
        description: 'README with architecture overview, component structure, and setup guide.',
        version: 'v1.0',
        lastUpdated: '2024-04-15',
        owner: 'Tech Elixir Core Team',
        previewAvailable: false,
        category: 'Network'
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
        category: 'SharePoint',
        severity: 'Medium',
        impact: 'Reliance on mock fallback can obscure data quality issues and limits production readiness.',
        suggestedRemediation: 'Implement robust SharePoint list mapping with explicit validation and telemetry for missing fields.',
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
    accessibilityChecks: [
      {
        id: 'TESC-CHK-001',
        requirement: 'All icon-only controls have accessible names',
        wcagReference: '4.1.2 Name, Role, Value (A)',
        status: 'Pass',
        impactArea: 'Screen Reader',
        notes: 'All Fluent UI Icon components include aria-label or are accompanied by visible text.',
        remediationGuidance: 'No action required.',
        owner: 'Tech Elixir Core Team',
        targetDate: '2024-04-15'
      },
      {
        id: 'TESC-CHK-002',
        requirement: 'Keyboard navigation works for all interactive controls',
        wcagReference: '2.1.1 Keyboard (A)',
        status: 'Pass',
        impactArea: 'Keyboard Navigation',
        notes: 'Pivot tabs, dropdowns, links, and detail list rows are all keyboard accessible.',
        remediationGuidance: 'No action required.',
        owner: 'Tech Elixir Core Team',
        targetDate: '2024-04-15'
      },
      {
        id: 'TESC-CHK-003',
        requirement: 'Severity badge colors meet minimum contrast ratio (4.5:1)',
        wcagReference: '1.4.3 Contrast Minimum (AA)',
        status: 'NeedsAttention',
        impactArea: 'Color Contrast',
        notes: 'Badge colors for NeedsAttention and Blocked states need contrast ratio verification against their background colors.',
        remediationGuidance: 'Run contrast analysis on all badge foreground/background color pairs. Update any pairs below 4.5:1 to compliant values using a contrast checker tool.',
        owner: 'Tech Elixir Core Team',
        targetDate: '2024-06-01',
        relatedDocumentUrl: 'https://github.com/lvs-jlouth/Tech-Elixir-Solution-Center/issues/12'
      },
      {
        id: 'TESC-CHK-004',
        requirement: 'Status information is not conveyed by color alone',
        wcagReference: '1.4.1 Use of Color (A)',
        status: 'Pass',
        impactArea: 'Color Contrast',
        notes: 'All status badges display both an icon and a text label alongside color.',
        remediationGuidance: 'No action required.',
        owner: 'Tech Elixir Core Team',
        targetDate: '2024-04-15'
      },
      {
        id: 'TESC-CHK-005',
        requirement: 'Animated loading spinners respect prefers-reduced-motion',
        wcagReference: '2.3.3 Animation from Interactions (AAA)',
        status: 'NotReviewed',
        impactArea: 'Motion Sensitivity',
        notes: 'Loading spinners and transition animations have not been reviewed for reduced-motion support.',
        remediationGuidance: 'Add CSS @media (prefers-reduced-motion: reduce) rules to pause or disable spinner animations and transitions.',
        owner: 'Tech Elixir Core Team',
        targetDate: '2024-07-01'
      },
      {
        id: 'TESC-CHK-006',
        requirement: 'Filter live region announces result count changes',
        wcagReference: '4.1.3 Status Messages (AA)',
        status: 'Pass',
        impactArea: 'Screen Reader',
        notes: 'Filter result count elements use aria-live="polite" to announce changes.',
        remediationGuidance: 'No action required.',
        owner: 'Tech Elixir Core Team',
        targetDate: '2024-04-15'
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
