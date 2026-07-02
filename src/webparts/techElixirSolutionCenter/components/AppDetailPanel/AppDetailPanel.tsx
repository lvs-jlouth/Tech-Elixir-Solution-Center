import * as React from 'react';
import {
  Panel,
  PanelType,
  Pivot,
  PivotItem,
  Stack,
  Text,
  Link,
  Icon,
  Spinner,
  SpinnerSize,
  ProgressIndicator
} from '@fluentui/react';

import { IApplication, AppStatus } from '../../models';
import { IHealthSummary, IIntegration, IDocument } from '../../models/IMockDataTypes';
import { HealthStatus, DocumentationStatus, DOCUMENTATION_SECTIONS } from '../../constants';
import { calculateDocCompleteness } from '../../utils/docCompleteness';
import { ReleaseTimeline } from '../ReleaseTimeline/ReleaseTimeline';
import { ArchitectureAssets } from '../ArchitectureAssets/ArchitectureAssets';
import { TechnicalDebtRegister } from '../TechnicalDebtRegister/TechnicalDebtRegister';
import { AccessibilityDashboard } from '../AccessibilityDashboard/AccessibilityDashboard';
import { SecurityStatus } from '../SecurityStatus/SecurityStatus';
import { DocumentMatrix } from '../DocumentMatrix/DocumentMatrix';
import { IntegrationInventory } from '../IntegrationInventory/IntegrationInventory';
import { GitHubMetadataSection } from '../GitHubMetadataSection/GitHubMetadataSection';
import { IGitHubMetadata } from '../../models/IGitHubMetadata';
import { IGitHubService } from '../../services/IGitHubService';
import styles from './AppDetailPanel.module.scss';

export interface IDetailDataService {
  getIntegrations(appId: string): Promise<IIntegration[]>;
  getDocuments(appId: string): Promise<IDocument[]>;
}

export interface IAppDetailPanelProps {
  app: IApplication;
  healthSummary: IHealthSummary | undefined;
  isOpen: boolean;
  onDismiss: () => void;
  dataService: IDetailDataService;
  /** Optional GitHub service — when provided, metadata is loaded and displayed in the Overview tab. */
  githubService?: IGitHubService;
}

// ── Shared config maps ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { background: string; color: string; label: string }> = {
  Active: { background: '#dff6dd', color: '#107c10', label: 'Active' },
  InDevelopment: { background: '#fff4ce', color: '#8a5700', label: 'In Development' },
  Deprecated: { background: '#fde7e9', color: '#a80000', label: 'Deprecated' },
  Planned: { background: '#f3f2f1', color: '#605e5c', label: 'Planned' }
};

const HEALTH_CONFIG: Record<string, { label: string; color: string; background: string }> = {
  [HealthStatus.Green]:   { label: 'Healthy',  color: '#107c10', background: '#dff6dd' },
  [HealthStatus.Yellow]:  { label: 'Warning',  color: '#8a5700', background: '#fff4ce' },
  [HealthStatus.Red]:     { label: 'Critical', color: '#a80000', background: '#fde7e9' },
  [HealthStatus.Unknown]: { label: 'Unknown',  color: '#605e5c', background: '#f3f2f1' }
};

const DOC_STATUS_CONFIG: Record<string, { color: string; background: string; label: string; icon: string }> = {
  [DocumentationStatus.Current]:  { color: '#107c10', background: '#dff6dd', label: 'Current',   icon: 'CheckMark' },
  [DocumentationStatus.Approved]: { color: '#107c10', background: '#dff6dd', label: 'Approved',  icon: 'Accept' },
  [DocumentationStatus.Draft]:    { color: '#8a5700', background: '#fff4ce', label: 'Draft',     icon: 'Edit' },
  [DocumentationStatus.InReview]: { color: '#8a5700', background: '#fff4ce', label: 'In Review', icon: 'Glasses' },
  [DocumentationStatus.Outdated]: { color: '#c43501', background: '#fed9cc', label: 'Outdated',  icon: 'Warning' },
  [DocumentationStatus.Missing]:  { color: '#a80000', background: '#fde7e9', label: 'Missing',   icon: 'ErrorBadge' }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveEnvironment(status: AppStatus): string {
  switch (status) {
    case 'Active':        return 'Production';
    case 'InDevelopment': return 'Development';
    case 'Deprecated':    return 'Production';
    case 'Planned':       return 'Development';
    default:              return 'Unknown';
  }
}

function getDocBarColor(pct: number): string {
  if (pct >= 75) return '#107c10';
  if (pct >= 50) return '#8a5700';
  return '#a80000';
}

// ── Component ─────────────────────────────────────────────────────────────────

export const AppDetailPanel: React.FC<IAppDetailPanelProps> = ({
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
  const [githubMetadata, setGitHubMetadata] = React.useState<IGitHubMetadata | undefined>(undefined);

  React.useEffect(() => {
    if (!isOpen) return;
    setLoadingDetails(true);
    const detailsPromise = Promise.all([
      dataService.getIntegrations(app.id),
      dataService.getDocuments(app.id)
    ]).then(([intgs, docs]) => {
      setIntegrations(intgs);
      setDocuments(docs);
    });

    const githubPromise =
      githubService && app.githubRepoUrl
        ? githubService.getMetadata(app.githubRepoUrl).then(meta => setGitHubMetadata(meta)).catch(() => undefined)
        : Promise.resolve();

    Promise.all([detailsPromise, githubPromise])
      .catch(() => undefined)
      .finally(() => setLoadingDetails(false));
  }, [isOpen, app.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values ──────────────────────────────────────────────────────────

  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG['Planned'];
  const latestRelease = app.releaseNotes && app.releaseNotes.length > 0 ? app.releaseNotes[0] : null;
  const environment   = deriveEnvironment(app.status);
  const sharepointLink = app.quickLinks?.find(l => l.url.toLowerCase().includes('sharepoint'))?.url;
  const archDocLink    = app.architectureDocs && app.architectureDocs.length > 0
    ? app.architectureDocs[0].url
    : undefined;

  // ── Sub-renderers ───────────────────────────────────────────────────────────

  function renderHealthBadge(label: string, value: string | undefined): JSX.Element {
    const cfg = (value && HEALTH_CONFIG[value]) ? HEALTH_CONFIG[value] : HEALTH_CONFIG[HealthStatus.Unknown];
    return (
      <div className={styles.healthItem}>
        <span className={styles.healthItemLabel}>{label}</span>
        <span
          className={styles.healthBadge}
          style={{ background: cfg.background, color: cfg.color }}
          aria-label={`${label}: ${cfg.label}`}
        >
          {cfg.label}
        </span>
      </div>
    );
  }

  function renderOverviewTab(): JSX.Element {
    return (
      <Stack tokens={{ childrenGap: 24 }}>
        {/* Description */}
        <section aria-labelledby="panel-desc-heading">
          <Text
            id="panel-desc-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 8 } }}
          >
            Description
          </Text>
          <Text>{app.description}</Text>
        </section>

        {/* Metadata */}
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
                <span
                  className={styles.inlineBadge}
                  style={{ background: statusCfg.background, color: statusCfg.color }}
                  aria-label={`Status: ${statusCfg.label}`}
                >
                  {statusCfg.label}
                </span>
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
                <dd>{latestRelease.date}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Links */}
        {(app.githubRepoUrl || sharepointLink || archDocLink || (app.quickLinks && app.quickLinks.length > 0)) && (
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
                  <Link href={app.githubRepoUrl} target="_blank" rel="noopener noreferrer">
                    {app.githubRepoUrl}
                  </Link>
                </div>
              )}
              {sharepointLink && (
                <div className={styles.linkRow}>
                  <Icon iconName="SharepointLogo" styles={{ root: { color: '#0078d4', fontSize: 16, flexShrink: 0 } }} aria-hidden />
                  <span className={styles.linkRowLabel}>SharePoint Site</span>
                  <Link href={sharepointLink} target="_blank" rel="noopener noreferrer">
                    View SharePoint Site
                  </Link>
                </div>
              )}
              {archDocLink && (
                <div className={styles.linkRow}>
                  <Icon iconName="Documentation" styles={{ root: { color: '#0078d4', fontSize: 16, flexShrink: 0 } }} aria-hidden />
                  <span className={styles.linkRowLabel}>Documentation Library</span>
                  <Link href={archDocLink} target="_blank" rel="noopener noreferrer">
                    View Architecture Docs
                  </Link>
                </div>
              )}
              {app.quickLinks && app.quickLinks.map((ql, idx) => (
                <div key={idx} className={styles.linkRow}>
                  <Icon
                    iconName={ql.iconName || 'Link'}
                    styles={{ root: { color: '#0078d4', fontSize: 16, flexShrink: 0 } }}
                    aria-hidden
                  />
                  <span className={styles.linkRowLabel}>{ql.label}</span>
                  <Link href={ql.url} target="_blank" rel="noopener noreferrer">
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Health indicators */}
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
              <div role="listitem">{renderHealthBadge('Overall',       healthSummary.overall)}</div>
              <div role="listitem">{renderHealthBadge('Documentation', healthSummary.documentation)}</div>
              <div role="listitem">{renderHealthBadge('Accessibility', healthSummary.accessibility)}</div>
              <div role="listitem">{renderHealthBadge('Security',      healthSummary.security)}</div>
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
              <Text
                variant="tiny"
                styles={{ root: { color: '#a19f9d', marginTop: 4, display: 'block' } }}
              >
                Last assessed: {healthSummary.lastAssessed}
              </Text>
            )}
          </section>
        )}

        {/* GitHub metadata */}
        <section aria-labelledby="panel-github-heading">
          <Text
            id="panel-github-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 10 } }}
          >
            GitHub Metadata
          </Text>
          <GitHubMetadataSection
            repositoryUrl={app.githubRepoUrl}
            metadata={githubMetadata}
          />
        </section>
      </Stack>
    );
  }

  function renderDocumentsTab(): JSX.Element {
    if (loadingDetails) {
      return <Spinner size={SpinnerSize.medium} label="Loading documents…" />;
    }

    // Compute completeness from the canonical section list + loaded records
    const completeness = calculateDocCompleteness(DOCUMENTATION_SECTIONS, documents);
    const barColor = getDocBarColor(completeness.completenessPercentage);

    return (
      <Stack tokens={{ childrenGap: 20 }}>
        {/* Completeness progress bar */}
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

        {/* Missing required sections alert */}
        {completeness.missingSectionKeys.length > 0 && (
          <div className={styles.missingSectionsAlert} role="alert" aria-label="Missing required sections">
            <Icon iconName="ErrorBadge" styles={{ root: { color: '#a80000', fontSize: 14, flexShrink: 0 } }} aria-hidden />
            <span>
              <strong>Missing required sections: </strong>
              {completeness.missingSectionKeys
                .map(k => DOCUMENTATION_SECTIONS.find(s => s.key === k)?.title ?? k)
                .join(', ')}
            </span>
          </div>
        )}

        {/* Section-by-section matrix */}
        <section aria-labelledby="docs-sections-heading">
          <Text
            id="docs-sections-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 8 } }}
          >
            Documentation Sections
          </Text>
          <DocumentMatrix
            app={app}
            documents={documents}
            sections={DOCUMENTATION_SECTIONS}
          />
        </section>
      </Stack>
    );
  }

  function renderIntegrationsTab(): JSX.Element {
    if (loadingDetails) {
      return <Spinner size={SpinnerSize.medium} label="Loading integrations…" />;
    }
    return (
      <IntegrationInventory
        integrations={integrations}
        title='Integration Inventory'
        emptyMessage='No integrations registered for this application.'
      />
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onDismiss}
      type={PanelType.large}
      headerText={app.name}
      closeButtonAriaLabel={`Close ${app.name} detail panel`}
      isLightDismiss
      styles={{
        header:          { paddingBottom: 0 },
        content:         { padding: '0 24px' },
        scrollableContent: { overflowY: 'auto' }
      }}
    >
      <Pivot
        aria-label={`${app.name} detail sections`}
        styles={{ root: { marginTop: 4, borderBottom: '1px solid #edebe9' } }}
      >
        <PivotItem headerText="Overview" itemIcon="Info" aria-label="Overview tab">
          <div className={styles.tabContent}>
            {renderOverviewTab()}
          </div>
        </PivotItem>

        <PivotItem headerText="Documents" itemIcon="Documentation" aria-label="Documents tab">
          <div className={styles.tabContent}>
            {renderDocumentsTab()}
          </div>
        </PivotItem>

        <PivotItem headerText="Releases" itemIcon="ReleaseGate" aria-label="Releases tab">
          <div className={styles.tabContent}>
            <ReleaseTimeline app={app} />
          </div>
        </PivotItem>

        <PivotItem headerText="Architecture" itemIcon="Flow" aria-label="Architecture tab">
          <div className={styles.tabContent}>
            <ArchitectureAssets app={app} />
          </div>
        </PivotItem>

        <PivotItem headerText="Integrations" itemIcon="PlugConnected" aria-label="Integrations tab">
          <div className={styles.tabContent}>
            {renderIntegrationsTab()}
          </div>
        </PivotItem>

        <PivotItem headerText="Technical Debt" itemIcon="Warning" aria-label="Technical debt tab">
          <div className={styles.tabContent}>
            <TechnicalDebtRegister app={app} />
          </div>
        </PivotItem>

        <PivotItem headerText="Accessibility" itemIcon="Accessibility" aria-label="Accessibility tab">
          <div className={styles.tabContent}>
            <AccessibilityDashboard app={app} />
          </div>
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
