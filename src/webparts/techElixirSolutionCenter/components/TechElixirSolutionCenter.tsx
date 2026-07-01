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

import { ITechElixirSolutionCenterProps } from './ITechElixirSolutionCenterProps';
import { IApplication } from '../models';
import { IHealthSummary } from '../models/IMockDataTypes';
import { AppDataService } from '../services/AppDataService';
import { MockDataService } from '../services/MockDataService';
import { AppOverviewCard } from './AppOverviewCard/AppOverviewCard';
import { AppDetailPanel } from './AppDetailPanel/AppDetailPanel';
import { DocCompletenessBar } from './DocCompletenessBar/DocCompletenessBar';
import { ArchitectureDocs } from './ArchitectureDocs/ArchitectureDocs';
import { ReleaseNotes } from './ReleaseNotes/ReleaseNotes';
import { GitHubLinks } from './GitHubLinks/GitHubLinks';
import { PowerPlatformRefs } from './PowerPlatformRefs/PowerPlatformRefs';
import { TechnicalDebt } from './TechnicalDebt/TechnicalDebt';
import { AccessibilityReview } from './AccessibilityReview/AccessibilityReview';
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
  private _dataService: AppDataService;
  private _mockDataService: MockDataService;

  constructor(props: ITechElixirSolutionCenterProps) {
    super(props);
    this._dataService = new AppDataService(props.context, props.listName);
    this._mockDataService = new MockDataService();
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
    if (prevProps.listName !== this.props.listName) {
      this._dataService = new AppDataService(this.props.context, this.props.listName);
      this._loadApps();
    }
  }

  private _loadApps(): void {
    this.setState({ isLoading: true, error: undefined });
    Promise.all([
      this._dataService.getApplications(),
      this._mockDataService.getAllHealthSummaries()
    ])
      .then(([apps, healthSummaries]) => {
        const filtered =
          this.props.selectedApp
            ? apps.filter(a => a.name.toLowerCase().includes(this.props.selectedApp.toLowerCase()))
            : apps;
        this.setState({ apps: filtered, healthSummaries, isLoading: false });
      })
      .catch(err => {
        this.setState({ isLoading: false, healthSummaries: [], error: `Failed to load application data: ${err.message}` });
      });
  }

  private _renderAppDetail(app: IApplication): JSX.Element {
    return (
      <Stack tokens={{ childrenGap: 16 }} key={app.id}>
        <AppOverviewCard app={app} />
        <DocCompletenessBar app={app} />
        <QuickLinks app={app} />
        <ArchitectureDocs app={app} />
        <ReleaseNotes app={app} />
        <GitHubLinks app={app} />
        <PowerPlatformRefs app={app} />
        <TechnicalDebt app={app} />
        <AccessibilityReview app={app} />
        <SecurityStatus app={app} />
      </Stack>
    );
  }

  private _renderCardsOverview(): JSX.Element {
    const { apps, healthSummaries } = this.state;
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
              compact
              healthSummary={healthSummaries.find(h => h.appId === app.id)}
              onSelect={(id) => this.setState({ selectedAppId: id })}
            />
          </div>
        ))}
      </div>
    );
  }

  public render(): React.ReactElement<ITechElixirSolutionCenterProps> {
    const { isDarkTheme, displayMode } = this.props;
    const { apps, healthSummaries, isLoading, error, selectedAppId } = this.state;
    const selectedApp = selectedAppId ? apps.find(a => a.id === selectedAppId) : undefined;

    return (
      <div className={`${styles.container} ${isDarkTheme ? styles.darkTheme : ''}`}>
        <div className={styles.header}>
          <Text className={styles.title} as='h1'>
            Tech Elixir Solution Center
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
          <MessageBar messageBarType={MessageBarType.info}>
            No applications found. Add apps to the SharePoint list or configure mock data.
          </MessageBar>
        ) : displayMode === 'cards' ? (
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
        ) : (
          /* List display mode: show all apps in a single scrollable section */
          <Stack tokens={{ childrenGap: 32 }}>
            {apps.map(app => (
              <Stack key={app.id} tokens={{ childrenGap: 12 }}>
                <Text className={styles.sectionHeading}>{app.name}</Text>
                {this._renderAppDetail(app)}
              </Stack>
            ))}
          </Stack>
        )}

        {/* Detail panel — opens when a card is selected from the grid */}
        {selectedApp && (
          <AppDetailPanel
            app={selectedApp}
            healthSummary={healthSummaries.find(h => h.appId === selectedApp.id)}
            isOpen={true}
            onDismiss={() => this.setState({ selectedAppId: undefined })}
            mockDataService={this._mockDataService}
          />
        )}
      </div>
    );
  }
}
