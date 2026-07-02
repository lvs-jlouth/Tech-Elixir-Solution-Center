import { IDropdownOption } from '@fluentui/react';

import { AppType } from '../constants';
import { IApplication, IReleaseNote } from '../models';
import { IHealthSummary } from '../models/IMockDataTypes';

export type SortField =
  | 'default'
  | 'title'
  | 'lastUpdated'
  | 'health'
  | 'docCompleteness'
  | 'environment'
  | 'version';

export interface ISolutionFilters {
  searchText: string;
  environmentFilter: string;
  statusFilter: string;
  healthFilter: string;
  accessibilityFilter: string;
  appTypeFilter: string;
}

export function deriveEnvironment(status: IApplication['status']): string {
  switch (status) {
    case 'Active':
    case 'Deprecated':
      return 'Production';
    case 'InDevelopment':
    case 'Planned':
      return 'Development';
    default:
      return 'Unknown';
  }
}

export function getStatusDisplayLabel(status: IApplication['status']): string {
  return status === 'InDevelopment' ? 'In Development' : status;
}

export function getDocBarColor(percentage: number): string {
  if (percentage >= 75) {
    return '#107c10';
  }

  if (percentage >= 50) {
    return '#8a5700';
  }

  return '#a80000';
}

export function formatDisplayDate(dateText: string | undefined, fallback: string = 'N/A'): string {
  if (!dateText) {
    return fallback;
  }

  const date = new Date(dateText);
  if (isNaN(date.getTime())) {
    return dateText;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function sortReleasesByDate(releases: ReadonlyArray<IReleaseNote>): IReleaseNote[] {
  return releases.slice().sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
}

export function getLatestRelease(app: IApplication): IReleaseNote | undefined {
  return app.releaseNotes.length > 0 ? sortReleasesByDate(app.releaseNotes)[0] : undefined;
}

export function getLatestReleaseDate(app: IApplication): string {
  return getLatestRelease(app)?.date || '';
}

export function getCurrentVersion(app: IApplication): string {
  return getLatestRelease(app)?.version || '';
}

export function getDerivedShortName(app: IApplication): string {
  if (app.shortName && app.shortName.trim().length > 0) {
    return app.shortName;
  }

  return app.name
    .split(/\s+/)
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase())
    .join('');
}

export function getDerivedAppType(app: IApplication): string {
  if (app.appType && app.appType.trim().length > 0) {
    return app.appType;
  }

  const normalizedTags = (app.tags || []).map(tag => tag.toLowerCase());
  const componentTypes = app.powerPlatformComponents.map(component => component.type);

  if (componentTypes.indexOf('PowerApp') >= 0 || componentTypes.indexOf('PowerAutomate') >= 0) {
    return AppType.PowerApp;
  }

  if (normalizedTags.some(tag => tag.indexOf('spfx') >= 0 || tag.indexOf('sharepoint') >= 0)) {
    return AppType.SPFxWebPart;
  }

  if (normalizedTags.some(tag => tag.indexOf('copilot') >= 0)) {
    return AppType.CopilotAgent;
  }

  if (normalizedTags.some(tag => tag.indexOf('azure') >= 0)) {
    return AppType.AzureSolution;
  }

  return AppType.HybridSolution;
}

export function getHealthSummaryForApp(
  healthSummaries: ReadonlyArray<IHealthSummary>,
  appId: string
): IHealthSummary | undefined {
  for (const summary of healthSummaries) {
    if (summary.appId === appId) {
      return summary;
    }
  }

  return undefined;
}

export function matchesSolutionSearch(app: IApplication, searchTerm: string): boolean {
  if (!searchTerm) {
    return true;
  }

  const normalizedStatus = getStatusDisplayLabel(app.status).toLowerCase();
  const valuesToSearch = [
    app.name,
    getDerivedShortName(app),
    app.description,
    app.owner,
    app.status,
    normalizedStatus
  ]
    .filter(Boolean)
    .map(value => value.toLowerCase());

  return valuesToSearch.some(value => value.indexOf(searchTerm) >= 0);
}

export function filterSolutions(
  apps: ReadonlyArray<IApplication>,
  healthSummaries: ReadonlyArray<IHealthSummary>,
  filters: ISolutionFilters
): IApplication[] {
  const normalizedSearch = filters.searchText.trim().toLowerCase();

  return apps.filter(app => {
    const summary = getHealthSummaryForApp(healthSummaries, app.id);
    const derivedEnvironment = deriveEnvironment(app.status);
    const derivedAppType = getDerivedAppType(app);
    const overallHealth = summary ? summary.overall : 'Unknown';
    const accessibilityHealth = summary ? summary.accessibility : 'Unknown';

    return (
      matchesSolutionSearch(app, normalizedSearch) &&
      (filters.environmentFilter === 'All' || derivedEnvironment === filters.environmentFilter) &&
      (filters.statusFilter === 'All' || app.status === filters.statusFilter) &&
      (filters.healthFilter === 'All' || overallHealth === filters.healthFilter) &&
      (filters.accessibilityFilter === 'All' || accessibilityHealth === filters.accessibilityFilter) &&
      (filters.appTypeFilter === 'All' || derivedAppType === filters.appTypeFilter)
    );
  });
}

export function healthRank(health: string): number {
  const ranks: Record<string, number> = { Healthy: 0, Warning: 1, Critical: 2, Unknown: 3 };
  return ranks[health] !== undefined ? ranks[health] : 3;
}

export function sortSolutions(
  apps: ReadonlyArray<IApplication>,
  healthSummaries: ReadonlyArray<IHealthSummary>,
  sortBy: SortField
): IApplication[] {
  if (sortBy === 'default') {
    return apps.slice();
  }

  return apps.slice().sort((left, right) => {
    switch (sortBy) {
      case 'title':
        return left.name.localeCompare(right.name);
      case 'lastUpdated':
        return getLatestReleaseDate(right).localeCompare(getLatestReleaseDate(left));
      case 'health': {
        const leftSummary = getHealthSummaryForApp(healthSummaries, left.id);
        const rightSummary = getHealthSummaryForApp(healthSummaries, right.id);
        return healthRank(leftSummary ? leftSummary.overall : 'Unknown') - healthRank(rightSummary ? rightSummary.overall : 'Unknown');
      }
      case 'docCompleteness':
        return right.docCompleteness - left.docCompleteness;
      case 'environment':
        return deriveEnvironment(left.status).localeCompare(deriveEnvironment(right.status));
      case 'version':
        return getCurrentVersion(right).localeCompare(getCurrentVersion(left));
      default:
        return 0;
    }
  });
}

export function buildDistinctOptions(
  values: ReadonlyArray<string>,
  allKey: string = 'All',
  allLabel: string = 'All'
): IDropdownOption[] {
  return [{ key: allKey, text: allLabel }].concat(
    values
      .filter((value, index, list) => value && list.indexOf(value) === index)
      .sort((left, right) => left.localeCompare(right))
      .map(value => ({ key: value, text: value }))
  );
}
