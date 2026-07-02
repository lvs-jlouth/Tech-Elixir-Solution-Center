import * as React from 'react';
import {
  DefaultButton,
  Dropdown,
  IDropdownOption,
  Pivot,
  PivotItem,
  Stack,
  Text,
  TextField
} from '@fluentui/react';

import { IApplication, IHealthSummary } from '../../models';
import {
  getHealthSummaryForApp,
  SortField
} from '../../utils/solutionDisplay';
import { AccessibilityDashboard } from '../AccessibilityDashboard/AccessibilityDashboard';
import { ArchitectureAssets } from '../ArchitectureAssets/ArchitectureAssets';
import { IDetailDataService } from '../AppDetailPanel/AppDetailPanel';
import { DocCompletenessBar } from '../DocCompletenessBar/DocCompletenessBar';
import { EmptyState, IEmptyStateListNames } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { GitHubLinks } from '../GitHubLinks/GitHubLinks';
import { LoadingState } from '../LoadingState/LoadingState';
import { PowerPlatformRefs } from '../PowerPlatformRefs/PowerPlatformRefs';
import { QuickLinks } from '../QuickLinks/QuickLinks';
import { ReleaseTimeline } from '../ReleaseTimeline/ReleaseTimeline';
import { SecurityStatus } from '../SecurityStatus/SecurityStatus';
import { SolutionCard } from '../SolutionCard/SolutionCard';
import { SolutionDetailPanel } from '../SolutionDetailPanel/SolutionDetailPanel';
import { TechnicalDebt } from '../TechnicalDebt/TechnicalDebt';
import styles from '../TechElixirSolutionCenter.module.scss';

export interface ISolutionDashboardProps {
  webPartTitle: string;
  isDarkTheme: boolean;
  isLoading: boolean;
  error: string | undefined;
  errorDetails?: string;
  onRetry?: () => void;
  useMockData: boolean;
  compactMode: boolean;
  showGitHubLinks: boolean;
  showPowerPlatformLinks: boolean;
  showAccessibilityDashboard: boolean;
  listNames: IEmptyStateListNames;
  siteUrl: string;
  apps: IApplication[];
  healthSummaries: IHealthSummary[];
  filteredApps: IApplication[];
  selectedApp: IApplication | undefined;
  searchText: string;
  environmentFilter: string;
  statusFilter: string;
  healthFilter: string;
  accessibilityFilter: string;
  appTypeFilter: string;
  sortBy: SortField;
  environmentOptions: IDropdownOption[];
  statusOptions: IDropdownOption[];
  healthOptions: IDropdownOption[];
  accessibilityOptions: IDropdownOption[];
  appTypeOptions: IDropdownOption[];
  onSearchTextChange: (value: string) => void;
  onEnvironmentFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onHealthFilterChange: (value: string) => void;
  onAccessibilityFilterChange: (value: string) => void;
  onAppTypeFilterChange: (value: string) => void;
  onSortByChange: (value: SortField) => void;
  onResetFilters: () => void;
  onSelectApp: (appId: string) => void;
  onDismissDetailPanel: () => void;
  dataService: IDetailDataService;
}

export const SolutionDashboard: React.FC<ISolutionDashboardProps> = ({
  webPartTitle,
  isDarkTheme,
  isLoading,
  error,
  errorDetails,
  onRetry,
  useMockData,
  compactMode,
  showGitHubLinks,
  showPowerPlatformLinks,
  showAccessibilityDashboard,
  listNames,
  siteUrl,
  apps,
  healthSummaries,
  filteredApps,
  selectedApp,
  searchText,
  environmentFilter,
  statusFilter,
  healthFilter,
  accessibilityFilter,
  appTypeFilter,
  sortBy,
  environmentOptions,
  statusOptions,
  healthOptions,
  accessibilityOptions,
  appTypeOptions,
  onSearchTextChange,
  onEnvironmentFilterChange,
  onStatusFilterChange,
  onHealthFilterChange,
  onAccessibilityFilterChange,
  onAppTypeFilterChange,
  onSortByChange,
  onResetFilters,
  onSelectApp,
  onDismissDetailPanel,
  dataService
}) => {
  const selectedAppHealthSummary = selectedApp
    ? getHealthSummaryForApp(healthSummaries, selectedApp.id)
    : undefined;
  const selectedStatusKey = statusFilter === 'InDevelopment' ? 'In Development' : statusFilter;

  const renderSolutionView = (app: IApplication): JSX.Element => (
    <Stack tokens={{ childrenGap: 16 }} key={app.id}>
      <SolutionCard app={app} compact={false} healthSummary={getHealthSummaryForApp(healthSummaries, app.id)} />
      <DocCompletenessBar app={app} />
      <QuickLinks app={app} />
      <ArchitectureAssets app={app} />
      <ReleaseTimeline app={app} />
      {showGitHubLinks !== false && <GitHubLinks app={app} />}
      {showPowerPlatformLinks !== false && <PowerPlatformRefs app={app} />}
      <TechnicalDebt app={app} />
      {showAccessibilityDashboard !== false && <AccessibilityDashboard app={app} />}
      <SecurityStatus app={app} />
    </Stack>
  );

  return (
    <div className={`${styles.container} ${isDarkTheme ? styles.darkTheme : ''}`}>
      <div className={styles.header}>
        <Text className={styles.title} as="h1">
          {webPartTitle || 'Tech Elixir Solution Center'}
        </Text>
        <Text className={styles.subtitle}>
          Living documentation and engineering dashboard for SharePoint-based app builds
        </Text>
      </div>

      {error && <ErrorState message={error} technicalDetails={errorDetails} onRetry={onRetry} />}

      {isLoading ? (
        <LoadingState label="Loading applications…" />
      ) : apps.length === 0 ? (
        <EmptyState listNames={listNames} useMockData={useMockData} siteUrl={siteUrl} />
      ) : (
        <>
          <section className={styles.filterSection} aria-label="Solution search and filters">
            <Stack tokens={{ childrenGap: 12 }}>
              <Text as="h2" className={styles.filterHeading}>
                Search and filter solutions
              </Text>
              <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
                <div className={styles.filterControl}>
                  <TextField
                    label="Search solutions"
                    value={searchText}
                    onChange={(_, value) => onSearchTextChange(value || '')}
                    placeholder="Search by title, short name, description, owner, or status"
                  />
                </div>
                <div className={styles.filterControl}>
                  <Dropdown
                    label="Environment"
                    selectedKey={environmentFilter}
                    options={environmentOptions}
                    onChange={(_, option) => onEnvironmentFilterChange(String(option ? option.key : 'All'))}
                  />
                </div>
                <div className={styles.filterControl}>
                  <Dropdown
                    label="Status"
                    selectedKey={selectedStatusKey}
                    options={statusOptions}
                    onChange={(_, option) =>
                      onStatusFilterChange(option && option.key === 'In Development' ? 'InDevelopment' : String(option ? option.key : 'All'))
                    }
                  />
                </div>
                <div className={styles.filterControl}>
                  <Dropdown
                    label="Health status"
                    selectedKey={healthFilter}
                    options={healthOptions}
                    onChange={(_, option) => onHealthFilterChange(String(option ? option.key : 'All'))}
                  />
                </div>
                <div className={styles.filterControl}>
                  <Dropdown
                    label="Accessibility status"
                    selectedKey={accessibilityFilter}
                    options={accessibilityOptions}
                    onChange={(_, option) => onAccessibilityFilterChange(String(option ? option.key : 'All'))}
                  />
                </div>
                <div className={styles.filterControl}>
                  <Dropdown
                    label="App type"
                    selectedKey={appTypeFilter}
                    options={appTypeOptions}
                    onChange={(_, option) => onAppTypeFilterChange(String(option ? option.key : 'All'))}
                  />
                </div>
                <div className={styles.filterControl}>
                  <Dropdown
                    label="Sort by"
                    selectedKey={sortBy}
                    options={[
                      { key: 'default', text: 'Default' },
                      { key: 'title', text: 'Title' },
                      { key: 'lastUpdated', text: 'Last updated' },
                      { key: 'health', text: 'Health status' },
                      { key: 'docCompleteness', text: 'Documentation completeness' },
                      { key: 'environment', text: 'Environment' },
                      { key: 'version', text: 'Current version' }
                    ]}
                    onChange={(_, option) => onSortByChange((option ? option.key : 'default') as SortField)}
                    ariaLabel="Sort solutions by field"
                  />
                </div>
              </Stack>
              <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <Text className={styles.visibleCount} aria-live="polite" aria-atomic="true">
                  {filteredApps.length} solution{filteredApps.length === 1 ? '' : 's'} visible
                </Text>
                <DefaultButton
                  text="Reset filters"
                  onClick={onResetFilters}
                  ariaLabel="Reset all search and filter controls"
                />
              </Stack>
            </Stack>
          </section>

          <Pivot className={styles.pivot} aria-label="Application tabs">
            <PivotItem headerText="All Apps" itemIcon="ViewAll">
              <div className={styles.appGrid} role="list" aria-label="Solution applications">
                {filteredApps.map(app => (
                  <div key={app.id} role="listitem">
                    <SolutionCard
                      app={app}
                      compact={compactMode !== false}
                      healthSummary={getHealthSummaryForApp(healthSummaries, app.id)}
                      onSelect={onSelectApp}
                    />
                  </div>
                ))}
              </div>
            </PivotItem>
            {filteredApps.map(app => (
              <PivotItem key={app.id} headerText={app.name} itemIcon="AppIconDefault">
                <div className={styles.appSection}>{renderSolutionView(app)}</div>
              </PivotItem>
            ))}
          </Pivot>
        </>
      )}

      {selectedApp && (
        <SolutionDetailPanel
          app={selectedApp}
          healthSummary={selectedAppHealthSummary}
          isOpen={true}
          onDismiss={onDismissDetailPanel}
          dataService={dataService}
        />
      )}
    </div>
  );
};
