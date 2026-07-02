export enum SolutionStatus {
  Planning = 'Planning',
  Development = 'Development',
  Testing = 'Testing',
  Production = 'Production',
  Retired = 'Retired'
}

export enum HealthStatus {
  Green = 'Green',
  Yellow = 'Yellow',
  Red = 'Red',
  Unknown = 'Unknown'
}

export enum AccessibilityStatus {
  NotReviewed = 'NotReviewed',
  InProgress = 'InProgress',
  Pass = 'Pass',
  NeedsAttention = 'NeedsAttention',
  Blocked = 'Blocked'
}

export enum SecurityStatus {
  NotReviewed = 'NotReviewed',
  Reviewed = 'Reviewed',
  NeedsAttention = 'NeedsAttention',
  Blocked = 'Blocked'
}

export enum DocumentationStatus {
  Missing = 'Missing',
  Draft = 'Draft',
  InReview = 'InReview',
  Approved = 'Approved',
  Current = 'Current',
  Outdated = 'Outdated'
}

export enum AppType {
  PowerApp = 'PowerApp',
  SPFxWebPart = 'SPFxWebPart',
  CopilotAgent = 'CopilotAgent',
  SharePointSolution = 'SharePointSolution',
  AzureSolution = 'AzureSolution',
  HybridSolution = 'HybridSolution'
}

export enum Environment {
  Development = 'Development',
  Test = 'Test',
  UAT = 'UAT',
  Production = 'Production'
}

export interface IDocumentationSection {
  key: string;
  number: string;
  title: string;
  description: string;
  required: boolean;
  recommendedFileNamePattern: string;
}

export const DOCUMENTATION_SECTIONS: ReadonlyArray<IDocumentationSection> = [
  {
    key: '00-overview',
    number: '00',
    title: 'Overview',
    description: 'Provides a high-level summary of the solution purpose, scope, and business outcomes.',
    required: true,
    recommendedFileNamePattern: '00-Overview.*'
  },
  {
    key: '01-architecture',
    number: '01',
    title: 'Architecture',
    description: 'Describes the solution architecture, major components, and integration boundaries.',
    required: true,
    recommendedFileNamePattern: '01-Architecture.*'
  },
  {
    key: '02-data-model',
    number: '02',
    title: 'Data Model',
    description: 'Documents core entities, relationships, data flows, and storage considerations.',
    required: true,
    recommendedFileNamePattern: '02-Data-Model.*'
  },
  {
    key: '03-screen-catalogue',
    number: '03',
    title: 'Screen Catalogue',
    description: 'Lists all screens/views with purpose, ownership, and usage context.',
    required: false,
    recommendedFileNamePattern: '03-Screen-Catalogue.*'
  },
  {
    key: '04-power-automate-flows',
    number: '04',
    title: 'Power Automate Flows',
    description: 'Captures automation flow inventory, triggers, actions, and dependencies.',
    required: false,
    recommendedFileNamePattern: '04-Power-Automate-Flows.*'
  },
  {
    key: '05-security',
    number: '05',
    title: 'Security',
    description: 'Defines security controls, threat considerations, and access management model.',
    required: true,
    recommendedFileNamePattern: '05-Security.*'
  },
  {
    key: '06-deployment-guide',
    number: '06',
    title: 'Deployment Guide',
    description: 'Provides deployment prerequisites, steps, rollback guidance, and environment notes.',
    required: true,
    recommendedFileNamePattern: '06-Deployment-Guide.*'
  },
  {
    key: '07-user-guide',
    number: '07',
    title: 'User Guide',
    description: 'Explains end-user workflows, features, and common usage scenarios.',
    required: false,
    recommendedFileNamePattern: '07-User-Guide.*'
  },
  {
    key: '08-admin-guide',
    number: '08',
    title: 'Admin Guide',
    description: 'Documents administrative setup, operational tasks, and support procedures.',
    required: false,
    recommendedFileNamePattern: '08-Admin-Guide.*'
  },
  {
    key: '09-roadmap',
    number: '09',
    title: 'Roadmap',
    description: 'Outlines planned enhancements, milestones, and future delivery phases.',
    required: false,
    recommendedFileNamePattern: '09-Roadmap.*'
  },
  {
    key: '10-appendices',
    number: '10',
    title: 'Appendices',
    description: 'Contains supporting references, glossary terms, and supplemental material.',
    required: false,
    recommendedFileNamePattern: '10-Appendices.*'
  }
] as const;
