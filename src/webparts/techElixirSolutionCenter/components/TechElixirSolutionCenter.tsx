import * as React from 'react';

import { IApplication } from '../models';
import { IHealthSummary } from '../models/IMockDataTypes';
import { MockDataService } from '../services/MockDataService';
import { SharePointDataService } from '../services/SharePointDataService';
import {
  buildDistinctOptions,
  filterSolutions,
  getDerivedAppType,
  getStatusDisplayLabel,
  deriveEnvironment,
  sortSolutions,
  SortField
} from '../utils/solutionDisplay';
import { telemetry } from '../utils/telemetry';
import { IDetailDataService } from './AppDetailPanel/AppDetailPanel';
import { IEmptyStateListNames } from './EmptyState/EmptyState';
import { ITechElixirSolutionCenterProps } from './ITechElixirSolutionCenterProps';
import { SolutionDashboard } from './SolutionDashboard/SolutionDashboard';

interface ITechElixirSolutionCenterState {
  apps: IApplication[];
  healthSummaries: IHealthSummary[];
  isLoading: boolean;
  error: string | undefined;
  errorDetails: string | undefined;
  selectedAppId: string | undefined;
  searchText: string;
  environmentFilter: string;
  statusFilter: string;
  healthFilter: string;
  accessibilityFilter: string;
  appTypeFilter: string;
  sortBy: SortField;
}

export default class TechElixirSolutionCenter extends React.Component<
  ITechElixirSolutionCenterProps,
  ITechElixirSolutionCenterState
> {
  private _mockDataService: MockDataService;
  private _spDataService: SharePointDataService;

  constructor(props: ITechElixirSolutionCenterProps) {
    super(props);
    this._mockDataService = new MockDataService();
    this._spDataService = new SharePointDataService(props.context, this._buildListNames(props));
    this.state = {
      apps: [],
      healthSummaries: [],
      isLoading: true,
      error: undefined,
      errorDetails: undefined,
      selectedAppId: undefined,
      searchText: '',
      environmentFilter: 'All',
      statusFilter: 'All',
      healthFilter: 'All',
      accessibilityFilter: 'All',
      appTypeFilter: 'All',
      sortBy: 'default'
    };
  }

  public componentDidMount(): void {
    this._loadApps();
  }

  public componentDidUpdate(prevProps: ITechElixirSolutionCenterProps): void {
    const listNamesChanged =
      prevProps.solutionRegistryListName !== this.props.solutionRegistryListName ||
      prevProps.documentsListName !== this.props.documentsListName ||
      prevProps.releasesListName !== this.props.releasesListName ||
      prevProps.technicalDebtListName !== this.props.technicalDebtListName ||
      prevProps.architectureAssetsListName !== this.props.architectureAssetsListName ||
      prevProps.integrationsListName !== this.props.integrationsListName ||
      prevProps.accessibilityChecksListName !== this.props.accessibilityChecksListName;

    if (prevProps.useMockData !== this.props.useMockData || listNamesChanged) {
      if (!this.props.useMockData) {
        this._spDataService = new SharePointDataService(this.props.context, this._buildListNames(this.props));
      }
      this._loadApps();
    } else if (prevProps.defaultSelectedSolution !== this.props.defaultSelectedSolution) {
      this._loadApps();
    }
  }

  private _buildListNames(props: ITechElixirSolutionCenterProps): IEmptyStateListNames {
    return {
      solutions: props.solutionRegistryListName || 'Solution Registry',
      documents: props.documentsListName || 'Solution Documents',
      releases: props.releasesListName || 'Solution Releases',
      technicalDebt: props.technicalDebtListName || 'Solution Technical Debt',
      architectureAssets: props.architectureAssetsListName || 'Solution Architecture Assets',
      integrations: props.integrationsListName || 'Solution Integrations',
      accessibilityChecks: props.accessibilityChecksListName || 'Solution Accessibility Checks'
    };
  }

  private _getActiveService(): IDetailDataService {
    return this.props.useMockData ? this._mockDataService : this._spDataService;
  }

  private _loadApps(): void {
    this.setState({ isLoading: true, error: undefined, errorDetails: undefined });

    const startMs = Date.now();

    const appsPromise: Promise<IApplication[]> = this.props.useMockData
      ? this._mockDataService.getApplications()
      : this._spDataService.getSolutions();

    Promise.all([appsPromise, this._mockDataService.getAllHealthSummaries()])
      .then(([apps, healthSummaries]) => {
        const durationMs = Date.now() - startMs;
        telemetry.trackLoadTime('appList', durationMs, { appCount: apps.length, useMockData: this.props.useMockData });

        const filteredApps = this.props.defaultSelectedSolution
          ? apps.filter(app =>
              app.name.toLowerCase().indexOf(this.props.defaultSelectedSolution.toLowerCase()) >= 0
            )
          : apps;

        this.setState({ apps: filteredApps, healthSummaries, isLoading: false });
      })
      .catch((error: unknown) => {
        const durationMs = Date.now() - startMs;
        const technicalMessage = error instanceof Error ? error.message : String(error);
        telemetry.trackError(error, 'TechElixirSolutionCenter._loadApps', {
          durationMs,
          useMockData: this.props.useMockData
        });
        this.setState({
          isLoading: false,
          healthSummaries: [],
          error: 'We were unable to load solution data. Please try again, or contact your administrator if the problem persists.',
          errorDetails: technicalMessage
        });
      });
  }

  private _resetFilters = (): void => {
    this.setState({
      searchText: '',
      environmentFilter: 'All',
      statusFilter: 'All',
      healthFilter: 'All',
      accessibilityFilter: 'All',
      appTypeFilter: 'All',
      sortBy: 'default'
    });
  };

  public render(): React.ReactElement<ITechElixirSolutionCenterProps> {
    const {
      apps,
      healthSummaries,
      isLoading,
      error,
      errorDetails,
      selectedAppId,
      searchText,
      environmentFilter,
      statusFilter,
      healthFilter,
      accessibilityFilter,
      appTypeFilter,
      sortBy
    } = this.state;

    const filteredApps = sortSolutions(
      filterSolutions(apps, healthSummaries, {
        searchText,
        environmentFilter,
        statusFilter,
        healthFilter,
        accessibilityFilter,
        appTypeFilter
      }),
      healthSummaries,
      sortBy
    );

    let selectedApp: IApplication | undefined;

    if (selectedAppId) {
      const selectedFromFiltered = filteredApps.filter(app => app.id === selectedAppId);
      const selectedFromAll = apps.filter(app => app.id === selectedAppId);
      selectedApp = selectedFromFiltered.length > 0 ? selectedFromFiltered[0] : selectedFromAll[0];
    }

    return (
      <SolutionDashboard
        webPartTitle={this.props.webPartTitle}
        webPartVersion="1.0.0"
        userDisplayName={this.props.context.pageContext.user?.displayName}
        siteTitle={this.props.context.pageContext.web?.title}
        isDarkTheme={this.props.isDarkTheme}
        isLoading={isLoading}
        error={error}
        errorDetails={errorDetails}
        onRetry={this._loadApps.bind(this)}
        useMockData={this.props.useMockData}
        compactMode={this.props.compactMode}
        showGitHubLinks={this.props.showGitHubLinks}
        showPowerPlatformLinks={this.props.showPowerPlatformLinks}
        showAccessibilityDashboard={this.props.showAccessibilityDashboard}
        listNames={this._buildListNames(this.props)}
        siteUrl={this.props.context.pageContext.web.absoluteUrl}
        apps={apps}
        healthSummaries={healthSummaries}
        filteredApps={filteredApps}
        selectedApp={selectedApp}
        searchText={searchText}
        environmentFilter={environmentFilter}
        statusFilter={statusFilter}
        healthFilter={healthFilter}
        accessibilityFilter={accessibilityFilter}
        appTypeFilter={appTypeFilter}
        sortBy={sortBy}
        environmentOptions={buildDistinctOptions(apps.map(app => deriveEnvironment(app.status)))}
        statusOptions={buildDistinctOptions(apps.map(app => getStatusDisplayLabel(app.status)))}
        healthOptions={buildDistinctOptions(healthSummaries.map(summary => summary.overall))}
        accessibilityOptions={buildDistinctOptions(healthSummaries.map(summary => summary.accessibility))}
        appTypeOptions={buildDistinctOptions(apps.map(app => getDerivedAppType(app)))}
        onSearchTextChange={value => this.setState({ searchText: value })}
        onEnvironmentFilterChange={value => this.setState({ environmentFilter: value })}
        onStatusFilterChange={value => this.setState({ statusFilter: value })}
        onHealthFilterChange={value => this.setState({ healthFilter: value })}
        onAccessibilityFilterChange={value => this.setState({ accessibilityFilter: value })}
        onAppTypeFilterChange={value => this.setState({ appTypeFilter: value })}
        onSortByChange={value => this.setState({ sortBy: value })}
        onResetFilters={this._resetFilters}
        onSelectApp={appId => this.setState({ selectedAppId: appId })}
        onDismissDetailPanel={() => this.setState({ selectedAppId: undefined })}
        dataService={this._getActiveService()}
      />
    );
  }
}
