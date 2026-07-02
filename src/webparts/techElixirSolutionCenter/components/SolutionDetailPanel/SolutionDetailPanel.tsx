import * as React from 'react';
import {
  Icon,
  Link,
  Panel,
  PanelType,
  Pivot,
  PivotItem,
  ProgressIndicator,
  Stack,
  Text
} from '@fluentui/react';

import { DOCUMENTATION_SECTIONS } from '../../constants';
import { IApplication, IHealthSummary, IDocument, IIntegration } from '../../models';
import { IGitHubMetadata } from '../../models/IGitHubMetadata';
import { IGitHubService } from '../../services/IGitHubService';
import { telemetry } from '../../utils/telemetry';
import { calculateDocCompleteness } from '../../utils/docCompleteness';
import {
  deriveEnvironment,
  formatDisplayDate,
  getDocBarColor,
  getLatestRelease
} from '../../utils/solutionDisplay';
import { APP_STATUS_APPEARANCE } from '../../utils/statusPresentation';
import { AccessibilityDashboard } from '../AccessibilityDashboard/AccessibilityDashboard';
import { ArchitectureAssets } from '../ArchitectureAssets/ArchitectureAssets';
import { DocumentMatrix } from '../DocumentMatrix/DocumentMatrix';
import { ErrorState } from '../ErrorState/ErrorState';
import { GitHubMetadataSection } from '../GitHubMetadataSection/GitHubMetadataSection';
import { HealthIndicator } from '../HealthIndicator/HealthIndicator';
import { IntegrationInventory } from '../IntegrationInventory/IntegrationInventory';
import { LoadingSkeleton } from '../LoadingState/LoadingSkeleton';
import { ReleaseTimeline } from '../ReleaseTimeline/ReleaseTimeline';
import { SecurityStatus } from '../SecurityStatus/SecurityStatus';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { TechnicalDebtRegister } from '../TechnicalDebtRegister/TechnicalDebtRegister';
import { sanitizeUrl } from '../../utils/urlUtils';
import styles from '../AppDetailPanel/AppDetailPanel.module.scss';

export interface IDetailDataService {
  getIntegrations(appId: string): Promise<IIntegration[]>;
  getDocuments(appId: string): Promise<IDocument[]>;
}

export interface ISolutionDetailPanelProps {
  app: IApplication;
  healthSummary: IHealthSummary | undefined;
  isOpen: boolean;
  onDismiss: () => void;
  dataService: IDetailDataService;
  githubService?: IGitHubService;
}

export const SolutionDetailPanel: React.FC<ISolutionDetailPanelProps> = ({
  app,
  healthSummary,
  isOpen,
  onDismiss,
  dataService,
  githubService
}) => {
  const [integrations, setIntegrations] = React.useState<IIntegration[]>([]);
  const [documents, setDocuments] = React.useState<IDocument[]>([]);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState<string | undefined>(undefined);
  const [detailsErrorDetails, setDetailsErrorDetails] = React.useState<string | undefined>(undefined);
  const [githubMetadata, setGitHubMetadata] = React.useState<IGitHubMetadata | undefined>(undefined);

  const loadDetails = React.useCallback((): (() => void) => {
    let isMounted = true;
    setLoadingDetails(true);
    setDetailsError(undefined);
    setDetailsErrorDetails(undefined);
    setGitHubMetadata(undefined);

    const startMs = Date.now();

    const doLoad = async (): Promise<void> => {
      try {
        const loadedValues = await Promise.all([dataService.getIntegrations(app.id), dataService.getDocuments(app.id)]);
        const loadedIntegrations = loadedValues[0];
        const loadedDocuments = loadedValues[1];

        if (!isMounted) {
          return;
        }

        const durationMs = Date.now() - startMs;
        telemetry.trackLoadTime('detailPanel', durationMs, { appId: app.id });
        setIntegrations(loadedIntegrations);
        setDocuments(loadedDocuments);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const technicalMessage = error instanceof Error ? error.message : String(error);
        telemetry.trackError(error, 'SolutionDetailPanel.loadDetails', { appId: app.id });
        setDetailsError('Some details could not be loaded. Please try again.');
        setDetailsErrorDetails(technicalMessage);
        setIntegrations([]);
        setDocuments([]);
      }

      if (isMounted) {
        setLoadingDetails(false);
      }
    };

    doLoad().catch(() => undefined);

    if (githubService && app.githubRepoUrl) {
      githubService
        .getRepositoryMetadata(app.githubRepoUrl)
        .then(metadata => {
          if (isMounted) {
            setGitHubMetadata(metadata);
          }
        })
        .catch(err => {
          telemetry.trackError(err, 'SolutionDetailPanel.loadGitHubMetadata', { appId: app.id });
        });
    }

    return () => {
      isMounted = false;
    };
  }, [app.githubRepoUrl, app.id, dataService, githubService]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    telemetry.trackEvent('DetailPanelOpened', { appId: app.id, appName: app.name });
    return loadDetails();
  }, [app.id, isOpen, loadDetails]);

  const statusAppearance = APP_STATUS_APPEARANCE[app.status];
  const latestRelease = getLatestRelease(app);
  const environment = deriveEnvironment(app.status);
  const sharePointLinks = app.quickLinks.filter(linkItem => linkItem.url.toLowerCase().indexOf('sharepoint') >= 0);
  const sharepointLink = sharePointLinks.length > 0 ? sharePointLinks[0].url : undefined;
  const architectureLink = app.architectureDocs.length > 0 ? app.architectureDocs[0].url : undefined;

  const renderOverviewTab = (): JSX.Element => (
    <Stack tokens={{ childrenGap: 24 }}>
      <section aria-labelledby="panel-desc-heading">
        <Text
          id="panel-desc-heading"
          variant="mediumPlus"
          styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 10 } }}
        >
          Description
        </Text>
        <Text>{app.description}</Text>
      </section>

      <section aria-labelledby="panel-meta-heading">
        <Text
          id="panel-meta-heading"
          variant="mediumPlus"
          styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 10 } }}
        >
          Details
        </Text>
        <dl className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <dt>Owner</dt>
            <dd>{app.owner}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>Status</dt>
            <dd>
              <StatusBadge {...statusAppearance} ariaLabel={`Status: ${statusAppearance.label}`} />
            </dd>
          </div>
          <div className={styles.detailItem}>
            <dt>Environment</dt>
            <dd>{environment}</dd>
          </div>
          <div className={styles.detailItem}>
            <dt>Current Version</dt>
            <dd>{latestRelease ? latestRelease.version : 'N/A'}</dd>
          </div>
          {latestRelease && (
            <div className={styles.detailItem}>
              <dt>Last Updated</dt>
              <dd>{formatDisplayDate(latestRelease.date)}</dd>
            </div>
          )}
        </dl>
      </section>

      {(app.githubRepoUrl || sharepointLink || architectureLink || app.quickLinks.length > 0) && (
        <section aria-labelledby="panel-links-heading">
          <Text
            id="panel-links-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 10 } }}
          >
            Links
          </Text>
          <div>
            {app.githubRepoUrl && (
              <div className={styles.linkRow}>
                <Icon iconName="CodeEdit" styles={{ root: { color: '#0078d4', fontSize: 16, flexShrink: 0 } }} aria-hidden />
                <span className={styles.linkRowLabel}>GitHub Repository</span>
                <Link href={sanitizeUrl(app.githubRepoUrl)} target="_blank" rel="noopener noreferrer">
                  {app.githubRepoUrl}
                </Link>
              </div>
            )}
            {sharepointLink && (
              <div className={styles.linkRow}>
                <Icon iconName="SharepointLogo" styles={{ root: { color: '#0078d4', fontSize: 16, flexShrink: 0 } }} aria-hidden />
                <span className={styles.linkRowLabel}>SharePoint Site</span>
                <Link href={sanitizeUrl(sharepointLink)} target="_blank" rel="noopener noreferrer">
                  View SharePoint Site
                </Link>
              </div>
            )}
            {architectureLink && (
              <div className={styles.linkRow}>
                <Icon iconName="Documentation" styles={{ root: { color: '#0078d4', fontSize: 16, flexShrink: 0 } }} aria-hidden />
                <span className={styles.linkRowLabel}>Documentation Library</span>
                <Link href={sanitizeUrl(architectureLink)} target="_blank" rel="noopener noreferrer">
                  View Architecture Docs
                </Link>
              </div>
            )}
            {app.quickLinks.map((quickLink, index) => (
              <div key={`${quickLink.label}-${index}`} className={styles.linkRow}>
                <Icon
                  iconName={quickLink.iconName || 'Link'}
                  styles={{ root: { color: '#0078d4', fontSize: 16, flexShrink: 0 } }}
                  aria-hidden
                />
                <span className={styles.linkRowLabel}>{quickLink.label}</span>
                <Link href={sanitizeUrl(quickLink.url)} target="_blank" rel="noopener noreferrer">
                  Open
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {healthSummary && (
        <section aria-labelledby="panel-health-heading">
          <Text
            id="panel-health-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 10 } }}
          >
            Health Indicators
          </Text>
          <div className={styles.healthGrid} role="list" aria-label="Health indicators">
            <div role="listitem">
              <HealthIndicator label="Overall" status={healthSummary.overall} />
            </div>
            <div role="listitem">
              <HealthIndicator label="Documentation" status={healthSummary.documentation} />
            </div>
            <div role="listitem">
              <HealthIndicator label="Accessibility" status={healthSummary.accessibility} />
            </div>
            <div role="listitem">
              <HealthIndicator label="Security" status={healthSummary.security} />
            </div>
          </div>
          {healthSummary.notes && (
            <Text
              variant="small"
              styles={{ root: { color: '#605e5c', fontStyle: 'italic', marginTop: 10, display: 'block' } }}
            >
              {healthSummary.notes}
            </Text>
          )}
          {healthSummary.lastAssessed && (
            <Text variant="tiny" styles={{ root: { color: '#a19f9d', marginTop: 4, display: 'block' } }}>
              Last assessed: {healthSummary.lastAssessed}
            </Text>
          )}
        </section>
      )}

      <section aria-labelledby="panel-github-heading">
        <Text
          id="panel-github-heading"
          variant="mediumPlus"
          styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 10 } }}
        >
          GitHub Metadata
        </Text>
        <GitHubMetadataSection repositoryUrl={app.githubRepoUrl} metadata={githubMetadata} />
      </section>
    </Stack>
  );

  const renderDocumentsTab = (): JSX.Element => {
    if (loadingDetails) {
      return <LoadingSkeleton variant="documents" />;
    }

    if (detailsError) {
      return (
        <ErrorState
          message={detailsError}
          technicalDetails={detailsErrorDetails}
          onRetry={() => { loadDetails(); }}
        />
      );
    }

    const completeness = calculateDocCompleteness(DOCUMENTATION_SECTIONS, documents);
    const barColor = getDocBarColor(completeness.completenessPercentage);
    const missingTitles = completeness.missingSectionKeys.map(sectionKey => {
      const matches = DOCUMENTATION_SECTIONS.filter(section => section.key === sectionKey);
      return matches.length > 0 ? matches[0].title : sectionKey;
    });

    return (
      <Stack tokens={{ childrenGap: 20 }}>
        <section aria-labelledby="docs-completeness-heading">
          <Text
            id="docs-completeness-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 8 } }}
          >
            Documentation Completeness
          </Text>
          <ProgressIndicator
            label={`${completeness.completenessPercentage}% complete`}
            percentComplete={completeness.completenessPercentage / 100}
            styles={{ progressBar: { background: barColor }, itemName: { color: barColor } }}
            barHeight={10}
            ariaLabel={`Documentation completeness: ${completeness.completenessPercentage} percent`}
          />
        </section>

        {missingTitles.length > 0 && (
          <div className={styles.missingSectionsAlert} role="alert" aria-label="Missing required sections">
            <Icon iconName="ErrorBadge" styles={{ root: { color: '#a80000', fontSize: 14, flexShrink: 0 } }} aria-hidden />
            <span>
              <strong>Missing required sections: </strong>
              {missingTitles.join(', ')}
            </span>
          </div>
        )}

        <section aria-labelledby="docs-sections-heading">
          <Text
            id="docs-sections-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 8 } }}
          >
            Documentation Sections
          </Text>
          <DocumentMatrix app={app} documents={documents} sections={DOCUMENTATION_SECTIONS} />
        </section>
      </Stack>
    );
  };

  const renderIntegrationsTab = (): JSX.Element => {
    if (loadingDetails) {
      return <LoadingSkeleton variant="integrations" />;
    }

    if (detailsError) {
      return (
        <ErrorState
          message={detailsError}
          technicalDetails={detailsErrorDetails}
          onRetry={() => { loadDetails(); }}
        />
      );
    }

    return (
      <IntegrationInventory
        integrations={integrations}
        title="Integration Inventory"
        emptyMessage="No integrations registered for this application."
      />
    );
  };

  const renderReleasesTab = (): JSX.Element => {
    if (loadingDetails) {
      return <LoadingSkeleton variant="releases" />;
    }
    return <ReleaseTimeline app={app} />;
  };

  const renderArchitectureTab = (): JSX.Element => {
    if (loadingDetails) {
      return <LoadingSkeleton variant="architecture" />;
    }
    return <ArchitectureAssets app={app} />;
  };

  const renderTechnicalDebtTab = (): JSX.Element => {
    if (loadingDetails) {
      return <LoadingSkeleton variant="technicalDebt" />;
    }
    return <TechnicalDebtRegister app={app} />;
  };

  const renderAccessibilityTab = (): JSX.Element => {
    if (loadingDetails) {
      return <LoadingSkeleton variant="accessibility" />;
    }
    return <AccessibilityDashboard app={app} />;
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.large}
      headerText={app.name}
      closeButtonAriaLabel={`Close ${app.name} detail panel`}
      isLightDismiss
      styles={{
        header: { paddingBottom: 0 },
        content: { padding: '0 24px' },
        scrollableContent: { overflowY: 'auto' }
      }}
    >
      <Pivot aria-label={`${app.name} detail sections`} styles={{ root: { marginTop: 4, borderBottom: '1px solid #edebe9' } }}>
        <PivotItem headerText="Overview" itemIcon="Info" aria-label="Overview tab">
          <div className={styles.tabContent}>
            {loadingDetails ? <LoadingSkeleton variant="detailPanel" /> : renderOverviewTab()}
          </div>
        </PivotItem>
        <PivotItem headerText="Documents" itemIcon="Documentation" aria-label="Documents tab">
          <div className={styles.tabContent}>{renderDocumentsTab()}</div>
        </PivotItem>
        <PivotItem headerText="Releases" itemIcon="ReleaseGate" aria-label="Releases tab">
          <div className={styles.tabContent}>{renderReleasesTab()}</div>
        </PivotItem>
        <PivotItem headerText="Architecture" itemIcon="Flow" aria-label="Architecture tab">
          <div className={styles.tabContent}>{renderArchitectureTab()}</div>
        </PivotItem>
        <PivotItem headerText="Integrations" itemIcon="PlugConnected" aria-label="Integrations tab">
          <div className={styles.tabContent}>{renderIntegrationsTab()}</div>
        </PivotItem>
        <PivotItem headerText="Technical Debt" itemIcon="Warning" aria-label="Technical debt tab">
          <div className={styles.tabContent}>{renderTechnicalDebtTab()}</div>
        </PivotItem>
        <PivotItem headerText="Accessibility" itemIcon="Accessibility" aria-label="Accessibility tab">
          <div className={styles.tabContent}>{renderAccessibilityTab()}</div>
        </PivotItem>
        <PivotItem headerText="Security" itemIcon="Shield" aria-label="Security tab">
          <div className={styles.tabContent}>
            <SecurityStatus app={app} />
          </div>
        </PivotItem>
      </Pivot>
    </Panel>
  );
};
