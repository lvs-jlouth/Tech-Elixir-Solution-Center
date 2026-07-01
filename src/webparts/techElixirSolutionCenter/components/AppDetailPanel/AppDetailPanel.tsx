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
  ProgressIndicator,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn
} from '@fluentui/react';

import { IApplication, AppStatus } from '../../models';
import { IHealthSummary, IIntegration, IDocument } from '../../models/IMockDataTypes';
import { MockDataService } from '../../services/MockDataService';
import { HealthStatus, DocumentationStatus, DOCUMENTATION_SECTIONS } from '../../constants';
import { calculateDocCompleteness } from '../../utils/docCompleteness';
import { ReleaseNotes } from '../ReleaseNotes/ReleaseNotes';
import { ArchitectureDocs } from '../ArchitectureDocs/ArchitectureDocs';
import { TechnicalDebt } from '../TechnicalDebt/TechnicalDebt';
import { AccessibilityReview } from '../AccessibilityReview/AccessibilityReview';
import { SecurityStatus } from '../SecurityStatus/SecurityStatus';
import styles from './AppDetailPanel.module.scss';

export interface IAppDetailPanelProps {
  app: IApplication;
  healthSummary: IHealthSummary | undefined;
  isOpen: boolean;
  onDismiss: () => void;
  mockDataService: MockDataService;
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

const INTEGRATION_TYPE_ICONS: Record<string, string> = {
  SharePoint:    'SharepointLogo',
  PowerBI:       'BarChart4',
  PowerAutomate: 'Flow',
  Teams:         'TeamsLogo',
  Graph:         'BranchMerge',
  AzureFunction: 'AzureLogo',
  Dataverse:     'Database',
  GitHub:        'CodeEdit',
  External:      'Globe'
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
  mockDataService
}) => {
  const [integrations, setIntegrations] = React.useState<IIntegration[]>([]);
  const [documents, setDocuments] = React.useState<IDocument[]>([]);
  const [loadingDetails, setLoadingDetails] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setLoadingDetails(true);
    Promise.all([
      mockDataService.getIntegrations(app.id),
      mockDataService.getDocuments(app.id)
    ])
      .then(([intgs, docs]) => {
        setIntegrations(intgs);
        setDocuments(docs);
        setLoadingDetails(false);
      })
      .catch(() => setLoadingDetails(false));
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
      </Stack>
    );
  }

  function renderDocumentsTab(): JSX.Element {
    if (loadingDetails) {
      return <Spinner size={SpinnerSize.medium} label="Loading documents…" />;
    }

    // Build a lookup so we can merge DOCUMENTATION_SECTIONS with loaded document records
    const docByKey = new Map<string, IDocument>();
    documents.forEach(d => docByKey.set(d.sectionKey, d));

    // Compute completeness from the canonical section list + loaded records
    const completeness = calculateDocCompleteness(DOCUMENTATION_SECTIONS, documents);
    const barColor = getDocBarColor(completeness.completenessPercentage);

    // Build merged rows – one per canonical section, whether or not a record was loaded
    interface IDocRow {
      key: string;
      sectionNumber: string;
      sectionTitle: string;
      required: boolean;
      expectedFileName: string;
      status: DocumentationStatus;
      lastUpdated?: string;
      owner?: string;
      url?: string;
    }

    const rows: IDocRow[] = DOCUMENTATION_SECTIONS.map(section => {
      const doc = docByKey.get(section.key);
      return {
        key: section.key,
        sectionNumber: section.number,
        sectionTitle: section.title,
        required: section.required,
        expectedFileName: section.recommendedFileNamePattern,
        status: doc ? doc.status : DocumentationStatus.Missing,
        lastUpdated: doc?.lastUpdated,
        owner: doc?.owner,
        url: doc?.url
      };
    });

    const docColumns: IColumn[] = [
      {
        key: 'number',
        name: '#',
        minWidth: 30,
        maxWidth: 40,
        onRender: (item: IDocRow) => (
          <Text variant="small" styles={{ root: { color: '#605e5c' } }}>{item.sectionNumber}</Text>
        )
      },
      {
        key: 'title',
        name: 'Section',
        minWidth: 130,
        maxWidth: 180,
        onRender: (item: IDocRow) => (
          <Stack>
            <Text variant="small" styles={{ root: { fontWeight: 600 } }}>{item.sectionTitle}</Text>
            {item.required && (
              <Text variant="tiny" styles={{ root: { color: '#605e5c' } }}>Required</Text>
            )}
          </Stack>
        )
      },
      {
        key: 'expectedFileName',
        name: 'Expected File Name',
        minWidth: 160,
        maxWidth: 220,
        onRender: (item: IDocRow) => (
          <Text variant="tiny" styles={{ root: { color: '#605e5c', fontFamily: 'monospace' } }}>
            {item.expectedFileName}
          </Text>
        )
      },
      {
        key: 'status',
        name: 'Status',
        minWidth: 100,
        maxWidth: 130,
        onRender: (item: IDocRow) => {
          const cfg = DOC_STATUS_CONFIG[item.status] || { color: '#605e5c', background: '#f3f2f1', label: item.status, icon: 'Info' };
          return (
            <span
              className={styles.docStatusBadge}
              style={{ background: cfg.background, color: cfg.color }}
              aria-label={`Status: ${cfg.label}`}
              role="status"
            >
              <Icon iconName={cfg.icon} styles={{ root: { fontSize: 10, marginRight: 4, verticalAlign: 'middle' } }} aria-hidden />
              {cfg.label}
            </span>
          );
        }
      },
      {
        key: 'lastUpdated',
        name: 'Last Reviewed',
        minWidth: 90,
        maxWidth: 110,
        onRender: (item: IDocRow) => (
          <Text variant="small" styles={{ root: { color: '#605e5c' } }}>{item.lastUpdated || '—'}</Text>
        )
      },
      {
        key: 'owner',
        name: 'Owner',
        minWidth: 100,
        maxWidth: 160,
        onRender: (item: IDocRow) => (
          <Text variant="small">{item.owner || '—'}</Text>
        )
      },
      {
        key: 'url',
        name: 'Document',
        minWidth: 80,
        onRender: (item: IDocRow) =>
          item.url ? (
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              styles={{ root: { fontSize: 12 } }}
              aria-label={`Open ${item.sectionTitle} document (opens in new tab)`}
            >
              Open
            </Link>
          ) : (
            <Text variant="tiny" styles={{ root: { color: '#a19f9d' } }}>Not available</Text>
          )
      }
    ];

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

        {/* Summary stats */}
        <section aria-labelledby="docs-summary-heading">
          <Text
            id="docs-summary-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 8 } }}
          >
            Summary
          </Text>
          <div className={styles.docSummaryGrid} role="list" aria-label="Documentation completeness summary">
            <div className={styles.docSummaryItem} role="listitem">
              <div className={styles.docSummaryValue} aria-label={`${completeness.completedRequired} of ${completeness.totalRequired} required sections complete`}>
                {completeness.completedRequired}<span className={styles.docSummaryDenom}>/{completeness.totalRequired}</span>
              </div>
              <div className={styles.docSummaryLabel}>Required Complete</div>
            </div>
            <div className={styles.docSummaryItem} role="listitem">
              <div
                className={styles.docSummaryValue}
                style={{ color: completeness.missingRequired > 0 ? '#a80000' : '#107c10' }}
                aria-label={`${completeness.missingRequired} required sections missing`}
              >
                {completeness.missingRequired}
              </div>
              <div className={styles.docSummaryLabel}>Required Missing</div>
            </div>
            <div className={styles.docSummaryItem} role="listitem">
              <div className={styles.docSummaryValue} aria-label={`${completeness.optionalPresent} optional sections present`}>
                {completeness.optionalPresent}
              </div>
              <div className={styles.docSummaryLabel}>Optional Present</div>
            </div>
            <div className={styles.docSummaryItem} role="listitem">
              <div
                className={styles.docSummaryValue}
                style={{ color: barColor }}
                aria-label={`${completeness.completenessPercentage} percent complete`}
              >
                {completeness.completenessPercentage}%
              </div>
              <div className={styles.docSummaryLabel}>Completeness</div>
            </div>
          </div>
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
        </section>

        {/* Section-by-section table */}
        <section aria-labelledby="docs-sections-heading">
          <Text
            id="docs-sections-heading"
            variant="mediumPlus"
            styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 8 } }}
          >
            Documentation Sections
          </Text>
          <DetailsList
            items={rows}
            columns={docColumns}
            getKey={(item: IDocRow) => item.key}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            isHeaderVisible
            compact
            ariaLabel="Documentation sections"
          />
        </section>
      </Stack>
    );
  }

  function renderIntegrationsTab(): JSX.Element {
    if (loadingDetails) {
      return <Spinner size={SpinnerSize.medium} label="Loading integrations…" />;
    }
    if (integrations.length === 0) {
      return (
        <Text variant="small" styles={{ root: { color: '#a19f9d' } }}>
          No integrations registered for this application.
        </Text>
      );
    }

    const intColumns: IColumn[] = [
      {
        key: 'type',
        name: 'Type',
        minWidth: 100,
        maxWidth: 140,
        onRender: (item: IIntegration) => (
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
            <Icon
              iconName={INTEGRATION_TYPE_ICONS[item.type] || 'Globe'}
              styles={{ root: { color: '#0078d4', fontSize: 14 } }}
              aria-hidden
            />
            <Text variant="small">{item.type}</Text>
          </Stack>
        )
      },
      {
        key: 'name',
        name: 'Name',
        minWidth: 140,
        maxWidth: 220,
        onRender: (item: IIntegration) =>
          item.url ? (
            <Link href={item.url} target="_blank" rel="noopener noreferrer" styles={{ root: { fontSize: 13 } }}>
              {item.name}
            </Link>
          ) : (
            <Text variant="small">{item.name}</Text>
          )
      },
      {
        key: 'environment',
        name: 'Environment',
        minWidth: 90,
        maxWidth: 120,
        onRender: (item: IIntegration) => <Text variant="small">{item.environment}</Text>
      },
      {
        key: 'health',
        name: 'Health',
        minWidth: 80,
        maxWidth: 100,
        onRender: (item: IIntegration) => {
          const cfg = HEALTH_CONFIG[item.healthStatus] || HEALTH_CONFIG[HealthStatus.Unknown];
          return (
            <span
              style={{
                background: cfg.background,
                color: cfg.color,
                borderRadius: 10,
                padding: '1px 8px',
                fontSize: 11,
                fontWeight: 600
              }}
              aria-label={`Health: ${cfg.label}`}
            >
              {cfg.label}
            </span>
          );
        }
      },
      {
        key: 'description',
        name: 'Description',
        minWidth: 200,
        isMultiline: true,
        onRender: (item: IIntegration) => (
          <Text variant="small" styles={{ root: { color: '#605e5c' } }}>{item.description || '—'}</Text>
        )
      }
    ];

    return (
      <DetailsList
        items={integrations}
        columns={intColumns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible
        compact
        ariaLabel="Application integrations"
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
            <ReleaseNotes app={app} />
          </div>
        </PivotItem>

        <PivotItem headerText="Architecture" itemIcon="Flow" aria-label="Architecture tab">
          <div className={styles.tabContent}>
            <ArchitectureDocs app={app} />
          </div>
        </PivotItem>

        <PivotItem headerText="Integrations" itemIcon="PlugConnected" aria-label="Integrations tab">
          <div className={styles.tabContent}>
            {renderIntegrationsTab()}
          </div>
        </PivotItem>

        <PivotItem headerText="Technical Debt" itemIcon="Warning" aria-label="Technical debt tab">
          <div className={styles.tabContent}>
            <TechnicalDebt app={app} />
          </div>
        </PivotItem>

        <PivotItem headerText="Accessibility" itemIcon="Accessibility" aria-label="Accessibility tab">
          <div className={styles.tabContent}>
            <AccessibilityReview app={app} />
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
