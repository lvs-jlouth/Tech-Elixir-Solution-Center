import { DocumentationStatus, HealthStatus } from '../constants';
import {
  AccessibilityCheckStatus,
  AppStatus,
  ITechnicalDebtItem,
  SecurityDocStatus
} from '../models';
import { IIntegration } from '../models/IMockDataTypes';

export interface IStatusAppearance {
  label: string;
  color: string;
  background: string;
  iconName?: string;
}

export const APP_STATUS_APPEARANCE: Record<AppStatus, IStatusAppearance> = {
  Active: { background: '#dff6dd', color: '#107c10', label: 'Active' },
  InDevelopment: { background: '#fff4ce', color: '#8a5700', label: 'In Development' },
  Deprecated: { background: '#fde7e9', color: '#a80000', label: 'Deprecated' },
  Planned: { background: '#f3f2f1', color: '#605e5c', label: 'Planned' }
};

export const HEALTH_STATUS_APPEARANCE: Record<HealthStatus, IStatusAppearance> = {
  [HealthStatus.Green]: { label: 'Healthy', color: '#107c10', background: '#dff6dd' },
  [HealthStatus.Yellow]: { label: 'Warning', color: '#8a5700', background: '#fff4ce' },
  [HealthStatus.Red]: { label: 'Critical', color: '#a80000', background: '#fde7e9' },
  [HealthStatus.Unknown]: { label: 'Unknown', color: '#605e5c', background: '#f3f2f1' }
};

export const DOCUMENT_STATUS_APPEARANCE: Record<DocumentationStatus, IStatusAppearance> = {
  [DocumentationStatus.Current]: { label: 'Current', color: '#107c10', background: '#dff6dd', iconName: 'CheckMark' },
  [DocumentationStatus.Approved]: { label: 'Approved', color: '#107c10', background: '#dff6dd', iconName: 'Accept' },
  [DocumentationStatus.Draft]: { label: 'Draft', color: '#8a5700', background: '#fff4ce', iconName: 'Edit' },
  [DocumentationStatus.InReview]: { label: 'In Review', color: '#8a5700', background: '#fff4ce', iconName: 'Glasses' },
  [DocumentationStatus.Outdated]: { label: 'Outdated', color: '#c43501', background: '#fed9cc', iconName: 'Warning' },
  [DocumentationStatus.Missing]: { label: 'Missing', color: '#a80000', background: '#fde7e9', iconName: 'ErrorBadge' }
};

export const ACCESSIBILITY_STATUS_APPEARANCE: Record<AccessibilityCheckStatus, IStatusAppearance> = {
  Pass: { iconName: 'CheckMark', color: '#107c10', background: '#dff6dd', label: 'Pass' },
  NeedsAttention: { iconName: 'Warning', color: '#8a5700', background: '#fff4ce', label: 'Needs Attention' },
  Blocked: { iconName: 'BlockedSite', color: '#a80000', background: '#fde7e9', label: 'Blocked' },
  NotReviewed: { iconName: 'Clock', color: '#605e5c', background: '#f3f2f1', label: 'Not Reviewed' }
};

export const SECURITY_DOC_STATUS_APPEARANCE: Record<SecurityDocStatus, IStatusAppearance> = {
  Complete: { iconName: 'CheckMark', color: '#107c10', background: '#dff6dd', label: 'Complete' },
  InProgress: { iconName: 'SyncOccurence', color: '#8a5700', background: '#fff4ce', label: 'In Progress' },
  NeedsReview: { iconName: 'Warning', color: '#c43501', background: '#fed9cc', label: 'Needs Review' },
  NotStarted: { iconName: 'RemoveFilter', color: '#a80000', background: '#fde7e9', label: 'Not Started' }
};

export const TECHNICAL_DEBT_STATUS_APPEARANCE: Record<ITechnicalDebtItem['status'], IStatusAppearance> = {
  Open: { background: '#fde7e9', color: '#a80000', label: 'Open' },
  InProgress: { background: '#fff4ce', color: '#8a5700', label: 'In Progress' },
  Resolved: { background: '#dff6dd', color: '#107c10', label: 'Resolved' }
};

export const TECHNICAL_DEBT_SEVERITY_APPEARANCE: Record<ITechnicalDebtItem['severity'], IStatusAppearance> = {
  Critical: { background: '#fde7e9', color: '#a80000', label: 'Critical' },
  High: { background: '#fed9cc', color: '#c43501', label: 'High' },
  Medium: { background: '#fff4ce', color: '#8a5700', label: 'Medium' },
  Low: { background: '#dff6dd', color: '#107c10', label: 'Low' }
};

export const INTEGRATION_STATUS_APPEARANCE: Record<IIntegration['status'], IStatusAppearance> = {
  Active: { background: '#dff6dd', color: '#107c10', label: 'Active' },
  Degraded: { background: '#fff4ce', color: '#8a5700', label: 'Degraded' },
  Inactive: { background: '#fde7e9', color: '#a80000', label: 'Inactive' },
  Planned: { background: '#f3f2f1', color: '#605e5c', label: 'Planned' }
};

export const RELEASE_DEPLOYMENT_APPEARANCE: Record<
  NonNullable<import('../models').IReleaseNote['deploymentStatus']>,
  IStatusAppearance
> = {
  Deployed: { label: 'Deployed', iconName: 'Completed', color: '#107c10', background: '#dff6dd' },
  InProgress: { label: 'In Progress', iconName: 'Sync', color: '#8a5700', background: '#fff4ce' },
  Planned: { label: 'Planned', iconName: 'Calendar', color: '#605e5c', background: '#f3f2f1' },
  RolledBack: { label: 'Rolled Back', iconName: 'Undo', color: '#a80000', background: '#fde7e9' },
  Failed: { label: 'Failed', iconName: 'StatusErrorFull', color: '#a80000', background: '#fde7e9' }
};

export function getHealthAppearance(status: string | undefined): IStatusAppearance {
  switch (status) {
    case HealthStatus.Green:
      return HEALTH_STATUS_APPEARANCE[HealthStatus.Green];
    case HealthStatus.Yellow:
      return HEALTH_STATUS_APPEARANCE[HealthStatus.Yellow];
    case HealthStatus.Red:
      return HEALTH_STATUS_APPEARANCE[HealthStatus.Red];
    default:
      return HEALTH_STATUS_APPEARANCE[HealthStatus.Unknown];
  }
}
