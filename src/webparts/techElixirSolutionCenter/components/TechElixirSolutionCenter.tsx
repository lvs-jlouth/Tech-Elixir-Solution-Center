import * as React from 'react';
import {
  Pivot,
  PivotItem,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Stack,
  Text,
  TextField,
  Dropdown,
  IDropdownOption,
  DefaultButton
} from '@fluentui/react';
import { EmptyState } from './EmptyState/EmptyState';

import { ITechElixirSolutionCenterProps } from './ITechElixirSolutionCenterProps';
import { IApplication } from '../models';
import { IHealthSummary } from '../models/IMockDataTypes';
import { MockDataService } from '../services/MockDataService';
import { SharePointDataService } from '../services/SharePointDataService';
import { IDetailDataService } from './AppDetailPanel/AppDetailPanel';
import { AppOverviewCard } from './AppOverviewCard/AppOverviewCard';
import { AppDetailPanel } from './AppDetailPanel/AppDetailPanel';
import { DocCompletenessBar } from './DocCompletenessBar/DocCompletenessBar';
import { ArchitectureAssets } from './ArchitectureAssets/ArchitectureAssets';
import { ReleaseNotes } from './ReleaseNotes/ReleaseNotes';
import { GitHubLinks } from './GitHubLinks/GitHubLinks';
import { PowerPlatformRefs } from './PowerPlatformRefs/PowerPlatformRefs';
import { TechnicalDebt } from './TechnicalDebt/TechnicalDebt';
import { AccessibilityDashboard } from './AccessibilityDashboard/AccessibilityDashboard';
import { SecurityStatus } from './SecurityStatus/SecurityStatus';
import { QuickLinks } from './QuickLinks/QuickLinks';
import styles from './TechElixirSolutionCenter.module.scss';

interface ITechElixirSolutionCenterState {
  apps: IApplication[];
  healthSummaries: IHealthSummary[];
  isLoading: boolean;
  error: string | undefined;
  selectedAppId: string | undefined;
  searchText: string;
  environmentFilter: string;
  statusFilter: string;
  healthFilter: string;
  accessibilityFilter: string;
  appTypeFilter: string;
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
      selectedAppId: undefined,
      searchText: '',
      environmentFilter: 'All',
      statusFilter: 'All',
      healthFilter: 'All',
      accessibilityFilter: 'All',
      appTypeFilter: 'All'
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

  private _buildListNames(props: ITechElixirSolutionCenterProps): { solutions: string; documents: string; releases: string; technicalDebt: string; architectureAssets: string; integrations: string; accessibilityChecks: string } {
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
    this.setState({ isLoading: true, error: undefined });

    const appsPromise: Promise<IApplication[]> = this.props.useMockData
      ? this._mockDataService.getApplications()
      : this._spDataService.getSolutions();

    Promise.all([
      appsPromise,
      this._mockDataService.getAllHealthSummaries()
    ])
      .then(([apps, healthSummaries]) => {
        const filtered =
          this.props.defaultSelectedSolution
            ? apps.filter(a => a.name.toLowerCase().includes(this.props.defaultSelectedSolution.toLowerCase()))
            : apps;
        this.setState({ apps: filtered, healthSummaries, isLoading: false });
      })
      .catch(err => {
        this.setState({ isLoading: false, healthSummaries: [], error: `Failed to load application data: ${err.message}` });
      });
  }

  private _renderAppDetail(app: IApplication): JSX.Element {
    const { showGitHubLinks, showPowerPlatformLinks, showAccessibilityDashboard } = this.props;
    return (
      <Stack tokens={{ childrenGap: 16 }} key={app.id}>
        <AppOverviewCard app={app} />
        <DocCompletenessBar app={app} />
        <QuickLinks app={app} />
        <ArchitectureAssets app={app} />
        <ReleaseNotes app={app} />
        {showGitHubLinks !== false && <GitHubLinks app={app} />}
        {showPowerPlatformLinks !== false && <PowerPlatformRefs app={app} />}
        <TechnicalDebt app={app} />
        {showAccessibilityDashboard !== false && <AccessibilityDashboard app={app} />}
        <SecurityStatus app={app} />
      </Stack>
    );
  }

  private _getDerivedEnvironment(app: IApplication): string {
    if (app.status === 'Active' || app.status === 'Deprecated') {
      return 'Production';
    }

    if (app.status === 'InDevelopment' || app.status === 'Planned') {
      return 'Development';
    }

    return 'Unknown';
  }

  private _getDerivedShortName(app: IApplication): string {
    if (app.shortName && app.shortName.trim().length > 0) {
      return app.shortName;
    }

    return app.name
      .split(/\s+/)
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  private _getDerivedAppType(app: IApplication): string {
    if (app.appType && app.appType.trim().length > 0) {
      return app.appType;
    }

    const normalizedTags = (app.tags || []).map(tag => tag.toLowerCase());
    const componentTypes = app.powerPlatformComponents.map(component => component.type);

    if (componentTypes.indexOf('PowerApp') >= 0 || componentTypes.indexOf('PowerAutomate') >= 0) {
      return 'PowerApp';
    }

    if (normalizedTags.some(tag => tag.includes('spfx') || tag.includes('sharepoint'))) {
      return 'SPFxWebPart';
    }

    if (normalizedTags.some(tag => tag.includes('copilot'))) {
      return 'CopilotAgent';
    }

    if (normalizedTags.some(tag => tag.includes('azure'))) {
      return 'AzureSolution';
    }

    return 'HybridSolution';
  }

  private _getStatusLabel(status: string): string {
    return status === 'InDevelopment' ? 'In Development' : status;
  }

  private _matchesSearch(app: IApplication, searchTerm: string): boolean {
    if (!searchTerm) {
      return true;
    }

    const normalizedStatus = this._getStatusLabel(app.status).toLowerCase();
    const valuesToSearch = [
      app.name,
      this._getDerivedShortName(app),
      app.description,
      app.owner,
      app.status,
      normalizedStatus
    ]
      .filter(Boolean)
      .map(value => value.toLowerCase());

    return valuesToSearch.some(value => value.indexOf(searchTerm) >= 0);
  }

  private _getFilteredApps(): IApplication[] {
    const {
      apps,
      healthSummaries,
      searchText,
      environmentFilter,
      statusFilter,
      healthFilter,
      accessibilityFilter,
      appTypeFilter
    } = this.state;

    const normalizedSearch = searchText.trim().toLowerCase();

    return apps.filter(app => {
      const summary = healthSummaries.find(item => item.appId === app.id);
      const derivedEnvironment = this._getDerivedEnvironment(app);
      const derivedAppType = this._getDerivedAppType(app);
      const overallHealth = summary ? summary.overall : 'Unknown';
      const accessibilityHealth = summary ? summary.accessibility : 'Unknown';

      return (
        this._matchesSearch(app, normalizedSearch) &&
        (environmentFilter === 'All' || derivedEnvironment === environmentFilter) &&
        (statusFilter === 'All' || app.status === statusFilter) &&
        (healthFilter === 'All' || overallHealth === healthFilter) &&
        (accessibilityFilter === 'All' || accessibilityHealth === accessibilityFilter) &&
        (appTypeFilter === 'All' || derivedAppType === appTypeFilter)
      );
    });
  }

  private _buildFilterOptions(values: string[]): IDropdownOption[] {
    return [{ key: 'All', text: 'All' }].concat(
      values
        .filter((value, index, list) => value && list.indexOf(value) === index)
        .sort((a, b) => a.localeCompare(b))
        .map(value => ({ key: value, text: value }))
    );
  }

  private _resetFilters = (): void => {
    this.setState({
      searchText: '',
      environmentFilter: 'All',
      statusFilter: 'All',
      healthFilter: 'All',
      accessibilityFilter: 'All',
      appTypeFilter: 'All'
    });
  };

  private _renderCardsOverview(apps: IApplication[]): JSX.Element {
    const { healthSummaries } = this.state;
    const { compactMode } = this.props;
    return (
      <div
        className={styles.appGrid}
        role="list"
        aria-label="Solution applications"
      >
        {apps.map(app => (
          <div key={app.id} role="listitem">
            <AppOverviewCard
              app={app}
              compact={compactMode !== false}
              healthSummary={healthSummaries.find(h => h.appId === app.id)}
              onSelect={(id) => this.setState({ selectedAppId: id })}
            />
          </div>
        ))}
      </div>
    );
  }

  public render(): React.ReactElement<ITechElixirSolutionCenterProps> {
    const { isDarkTheme, webPartTitle } = this.props;
    const {
      apps,
      healthSummaries,
      isLoading,
      error,
      selectedAppId,
      searchText,
      environmentFilter,
      statusFilter,
      healthFilter,
      accessibilityFilter,
      appTypeFilter
    } = this.state;
    const filteredApps = this._getFilteredApps();
    const selectedApp = selectedAppId ? filteredApps.find(a => a.id === selectedAppId) : undefined;
    const environmentOptions = this._buildFilterOptions(apps.map(app => this._getDerivedEnvironment(app)));
    const statusOptions = this._buildFilterOptions(apps.map(app => app.status).map(status => this._getStatusLabel(status)));
    const healthOptions = this._buildFilterOptions(healthSummaries.map(summary => summary.overall));
    const accessibilityOptions = this._buildFilterOptions(healthSummaries.map(summary => summary.accessibility));
    const appTypeOptions = this._buildFilterOptions(apps.map(app => this._getDerivedAppType(app)));
    const selectedStatusKey = statusFilter === 'InDevelopment' ? 'In Development' : statusFilter;

    return (
      <div className={`${styles.container} ${isDarkTheme ? styles.darkTheme : ''}`}>
        <div className={styles.header}>
          <Text className={styles.title} as='h1'>
            {webPartTitle || 'Tech Elixir Solution Center'}
          </Text>
          <Text className={styles.subtitle}>
            Living documentation and engineering dashboard for SharePoint-based app builds
          </Text>
        </div>

        {error && (
          <MessageBar
            messageBarType={MessageBarType.error}
            className={styles.errorBanner}
            isMultiline={false}
          >
            {error}
          </MessageBar>
        )}

        {isLoading ? (
          <Spinner size={SpinnerSize.large} label='Loading applications…' />
        ) : apps.length === 0 ? (
          <EmptyState
            listNames={this._buildListNames(this.props)}
            useMockData={this.props.useMockData}
            siteUrl={this.props.context.pageContext.web.absoluteUrl}
          />
        ) : (
          <>
            <section className={styles.filterSection} aria-label='Solution search and filters'>
              <Stack tokens={{ childrenGap: 12 }}>
                <Text as='h2' className={styles.filterHeading}>Search and filter solutions</Text>
                <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
                  <div className={styles.filterControl}>
                    <TextField
                      label='Search solutions'
                      value={searchText}
                      onChange={(_, value) => this.setState({ searchText: value || '' })}
                      placeholder='Search by title, short name, description, owner, or status'
                    />
                  </div>
                  <div className={styles.filterControl}>
                    <Dropdown
                      label='Environment'
                      selectedKey={environmentFilter}
                      options={environmentOptions}
                      onChange={(_, option) => this.setState({ environmentFilter: String(option ? option.key : 'All') })}
                    />
                  </div>
                  <div className={styles.filterControl}>
                    <Dropdown
                      label='Status'
                      selectedKey={selectedStatusKey}
                      options={statusOptions}
                      onChange={(_, option) =>
                        this.setState({ statusFilter: option && option.key === 'In Development' ? 'InDevelopment' : String(option ? option.key : 'All') })
                      }
                    />
                  </div>
                  <div className={styles.filterControl}>
                    <Dropdown
                      label='Health status'
                      selectedKey={healthFilter}
                      options={healthOptions}
                      onChange={(_, option) => this.setState({ healthFilter: String(option ? option.key : 'All') })}
                    />
                  </div>
                  <div className={styles.filterControl}>
                    <Dropdown
                      label='Accessibility status'
                      selectedKey={accessibilityFilter}
                      options={accessibilityOptions}
                      onChange={(_, option) => this.setState({ accessibilityFilter: String(option ? option.key : 'All') })}
                    />
                  </div>
                  <div className={styles.filterControl}>
                    <Dropdown
                      label='App type'
                      selectedKey={appTypeFilter}
                      options={appTypeOptions}
                      onChange={(_, option) => this.setState({ appTypeFilter: String(option ? option.key : 'All') })}
                    />
                  </div>
                </Stack>
                <Stack horizontal horizontalAlign='space-between' verticalAlign='center'>
                  <Text className={styles.visibleCount}>{filteredApps.length} solution{filteredApps.length === 1 ? '' : 's'} visible</Text>
                  <DefaultButton
                    text='Reset filters'
                    onClick={this._resetFilters}
                    ariaLabel='Reset all search and filter controls'
                  />
                </Stack>
              </Stack>
            </section>

            <Pivot className={styles.pivot} aria-label='Application tabs'>
            <PivotItem headerText='All Apps' itemIcon='ViewAll'>
              {this._renderCardsOverview(filteredApps)}
            </PivotItem>
            {filteredApps.map(app => (
              <PivotItem key={app.id} headerText={app.name} itemIcon='AppIconDefault'>
                <div className={styles.appSection}>
                  {this._renderAppDetail(app)}
                </div>
              </PivotItem>
            ))}
            </Pivot>
          </>
        )}

        {/* Detail panel — opens when a card is selected from the grid */}
        {selectedApp && (
          <AppDetailPanel
            app={selectedApp}
            healthSummary={healthSummaries.find(h => h.appId === selectedApp.id)}
            isOpen={true}
            onDismiss={() => this.setState({ selectedAppId: undefined })}
            dataService={this._getActiveService()}
          />
        )}
      </div>
    );
  }
}
