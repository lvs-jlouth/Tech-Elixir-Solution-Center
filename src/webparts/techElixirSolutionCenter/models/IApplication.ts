export interface IQuickLink {
  label: string;
  url: string;
  iconName?: string;
}

export interface IPowerPlatformComponent {
  name: string;
  type: 'PowerApp' | 'PowerAutomate' | 'Connector' | 'Dataverse' | 'Other';
  url?: string;
  description?: string;
}

export interface ITechnicalDebtItem {
  id: string;
  title: string;
  description: string;
  category: 'Architecture' | 'Security' | 'Accessibility' | 'Performance' | 'Documentation' | 'Maintainability' | 'Power Platform' | 'SharePoint' | 'DevOps';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  suggestedRemediation: string;
  owner: string;
  targetRelease: string;
  status: 'Open' | 'InProgress' | 'Resolved';
  createdDate: string;
  lastUpdatedDate: string;
}

export interface IAccessibilityItem {
  id: string;
  requirement: string;
  wcagCriteria: string;
  status: 'Pass' | 'Fail' | 'NeedsReview' | 'NotApplicable';
  notes?: string;
}

export interface IArchitectureDoc {
  title: string;
  url: string;
  description?: string;
  lastUpdated?: string;
}

export interface IReleaseNote {
  version: string;
  date: string;
  releaseType?: 'Major' | 'Minor' | 'Patch' | 'Hotfix' | 'Beta' | 'Preview' | 'GeneralAvailability';
  summary: string;
  changes: string[];
  documentationChanges?: string[];
  githubReleaseUrl?: string;
  deploymentStatus?: 'Deployed' | 'InProgress' | 'Planned' | 'RolledBack' | 'Failed';
  releaseOwner?: string;
  knownIssues?: string[];
}

export type SecurityDocStatus = 'Complete' | 'InProgress' | 'NotStarted' | 'NeedsReview';

export interface ISecurityStatus {
  threatModelComplete: SecurityDocStatus;
  dataClassificationComplete: SecurityDocStatus;
  securityReviewComplete: SecurityDocStatus;
  privacyImpactAssessment: SecurityDocStatus;
  notes?: string;
}

export type AppStatus = 'Active' | 'InDevelopment' | 'Deprecated' | 'Planned';

export interface IApplication {
  id: string;
  name: string;
  description: string;
  status: AppStatus;
  owner: string;
  docCompleteness: number;
  architectureDocs: IArchitectureDoc[];
  releaseNotes: IReleaseNote[];
  githubRepoUrl?: string;
  powerPlatformComponents: IPowerPlatformComponent[];
  technicalDebt: ITechnicalDebtItem[];
  accessibilityItems: IAccessibilityItem[];
  securityStatus: ISecurityStatus;
  quickLinks: IQuickLink[];
  tags?: string[];
}
