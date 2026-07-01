import * as React from 'react';
import {
  Pivot,
  PivotItem,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  Stack,
  Text
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
      selectedAppId: undefined
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

  private _renderCardsOverview(): JSX.Element {
    const { apps, healthSummaries } = this.state;
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
    const { apps, healthSummaries, isLoading, error, selectedAppId } = this.state;
    const selectedApp = selectedAppId ? apps.find(a => a.id === selectedAppId) : undefined;

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
          <Pivot className={styles.pivot} aria-label='Application tabs'>
            <PivotItem headerText='All Apps' itemIcon='ViewAll'>
              {this._renderCardsOverview()}
            </PivotItem>
            {apps.map(app => (
              <PivotItem key={app.id} headerText={app.name} itemIcon='AppIconDefault'>
                <div className={styles.appSection}>
                  {this._renderAppDetail(app)}
                </div>
              </PivotItem>
            ))}
          </Pivot>
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
