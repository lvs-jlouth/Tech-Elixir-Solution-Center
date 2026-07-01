/**
 * DocumentMatrix.tsx
 *
 * Renders an accessible table-like matrix of documentation sections for a
 * given solution application.  Each row maps one IDocumentationSection to its
 * matching IDocument record (if any), showing:
 *   – Section number & title
 *   – Required / Optional
 *   – Current status (colour-coded badge)
 *   – Document link
 *   – Last modified date
 *   – Owner
 *   – Review status (derived from documentation status)
 *   – Action needed
 *
 * Built with Fluent UI DetailsList for full keyboard and screen-reader support.
 */

import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  Link,
  Icon,
  Stack,
  Text
} from '@fluentui/react';

import { IApplication } from '../../models/IApplication';
import { IDocument } from '../../models/IMockDataTypes';
import { IDocumentationSection, DocumentationStatus } from '../../constants';
import styles from './DocumentMatrix.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IDocumentMatrixProps {
  /** The solution application being viewed. */
  app: IApplication;
  /** All document records for this application (pre-filtered by appId). */
  documents: IDocument[];
  /** Full ordered list of documentation section definitions. */
  sections: ReadonlyArray<IDocumentationSection>;
}

/** Internal row model – one per section definition. */
interface IMatrixRow {
  key: string;
  sectionNumber: string;
  sectionTitle: string;
  required: boolean;
  status: DocumentationStatus;
  url: string | undefined;
  lastUpdated: string | undefined;
  owner: string | undefined;
  reviewStatus: string;
  action: string;
  notes: string | undefined;
}

// ── Configuration maps ────────────────────────────────────────────────────────

interface IStatusConfig {
  label: string;
  color: string;
  background: string;
  icon: string;
}

const DOC_STATUS_CONFIG: Record<DocumentationStatus, IStatusConfig> = {
  [DocumentationStatus.Current]:  { label: 'Current',   color: '#107c10', background: '#dff6dd', icon: 'CheckMark'  },
  [DocumentationStatus.Approved]: { label: 'Approved',  color: '#107c10', background: '#dff6dd', icon: 'Accept'     },
  [DocumentationStatus.Draft]:    { label: 'Draft',     color: '#8a5700', background: '#fff4ce', icon: 'Edit'       },
  [DocumentationStatus.InReview]: { label: 'In Review', color: '#8a5700', background: '#fff4ce', icon: 'Glasses'    },
  [DocumentationStatus.Outdated]: { label: 'Outdated',  color: '#c43501', background: '#fed9cc', icon: 'Warning'    },
  [DocumentationStatus.Missing]:  { label: 'Missing',   color: '#a80000', background: '#fde7e9', icon: 'ErrorBadge' }
};

/** Derives a plain-English review status from the document status. */
function deriveReviewStatus(status: DocumentationStatus): string {
  switch (status) {
    case DocumentationStatus.Current:  return 'Reviewed & Current';
    case DocumentationStatus.Approved: return 'Reviewed & Approved';
    case DocumentationStatus.InReview: return 'In Review';
    case DocumentationStatus.Draft:    return 'Pending Review';
    case DocumentationStatus.Outdated: return 'Review Needed';
    case DocumentationStatus.Missing:  return 'Not Reviewed';
    default:                           return 'Unknown';
  }
}

/** Derives the action needed based on status and whether the section is required. */
function deriveAction(status: DocumentationStatus, required: boolean): string {
  switch (status) {
    case DocumentationStatus.Missing:
      return required ? 'Create document (required)' : 'Create document';
    case DocumentationStatus.Draft:
      return 'Submit for review';
    case DocumentationStatus.InReview:
      return 'Complete review';
    case DocumentationStatus.Outdated:
      return 'Update & re-submit';
    case DocumentationStatus.Approved:
    case DocumentationStatus.Current:
      return '';
    default:
      return '';
  }
}

// ── Legend items ──────────────────────────────────────────────────────────────

const LEGEND_STATUSES: DocumentationStatus[] = [
  DocumentationStatus.Current,
  DocumentationStatus.Approved,
  DocumentationStatus.InReview,
  DocumentationStatus.Draft,
  DocumentationStatus.Outdated,
  DocumentationStatus.Missing
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return iso;
  }
}

function buildRows(
  sections: ReadonlyArray<IDocumentationSection>,
  documents: IDocument[]
): IMatrixRow[] {
  return sections.map(section => {
    const doc = documents.find(d => d.sectionKey === section.key);
    const status = doc ? doc.status : DocumentationStatus.Missing;
    return {
      key:           section.key,
      sectionNumber: section.number,
      sectionTitle:  section.title,
      required:      section.required,
      status,
      url:           doc?.url,
      lastUpdated:   doc?.lastUpdated,
      owner:         doc?.owner,
      reviewStatus:  deriveReviewStatus(status),
      action:        deriveAction(status, section.required),
      notes:         doc?.notes
    };
  });
}

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function renderStatusBadge(status: DocumentationStatus): JSX.Element {
  const cfg = DOC_STATUS_CONFIG[status];
  return (
    <span
      className={styles.statusBadge}
      style={{ background: cfg.background, color: cfg.color }}
      aria-label={`Status: ${cfg.label}`}
    >
      <Icon iconName={cfg.icon} aria-hidden styles={{ root: { fontSize: 10 } }} />
      {cfg.label}
    </span>
  );
}

function renderAction(action: string): JSX.Element {
  if (!action) {
    return <span className={styles.actionNone}>No action needed</span>;
  }
  return (
    <span className={styles.actionChip} aria-label={`Action: ${action}`}>
      <Icon iconName='TaskSolid' aria-hidden styles={{ root: { fontSize: 10 } }} />
      {action}
    </span>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────────

interface ISummaryProps {
  rows: IMatrixRow[];
  totalRequired: number;
}

const SummaryBar: React.FC<ISummaryProps> = ({ rows, totalRequired }) => {
  const totalSections = rows.length;
  const missing   = rows.filter(r => r.status === DocumentationStatus.Missing).length;
  const complete  = rows.filter(r =>
    r.status === DocumentationStatus.Current || r.status === DocumentationStatus.Approved
  ).length;
  const actionsNeeded = rows.filter(r => r.action !== '').length;
  const requiredMissing = rows.filter(r => r.required && r.status === DocumentationStatus.Missing).length;

  const stats: Array<{ value: string; label: string; accent?: string }> = [
    { value: `${complete}/${totalSections}`, label: 'Complete' },
    { value: String(missing),             label: 'Missing',          accent: missing > 0 ? '#a80000' : undefined },
    { value: String(requiredMissing),     label: 'Required Missing', accent: requiredMissing > 0 ? '#a80000' : undefined },
    { value: String(actionsNeeded),       label: 'Actions Needed',   accent: actionsNeeded > 0 ? '#8a5700' : undefined },
    { value: String(totalRequired),       label: 'Required Sections' }
  ];

  return (
    <div className={styles.summaryBar} role="region" aria-label="Documentation completeness summary">
      {stats.map(s => (
        <div key={s.label} className={styles.summaryStat}>
          <span
            className={styles.summaryValue}
            style={s.accent ? { color: s.accent } : undefined}
          >
            {s.value}
          </span>
          <span className={styles.summaryLabel}>{s.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const DocumentMatrix: React.FC<IDocumentMatrixProps> = ({
  app,
  documents,
  sections
}) => {
  const rows = React.useMemo(
    () => buildRows(sections, documents),
    [sections, documents]
  );

  const totalRequired = React.useMemo(
    () => sections.filter(s => s.required).length,
    [sections]
  );

  const columns: IColumn[] = [
    {
      key: 'col-num',
      name: '#',
      fieldName: 'sectionNumber',
      minWidth: 28,
      maxWidth: 36,
      isResizable: false,
      onRender: (row: IMatrixRow) => (
        <span className={styles.sectionNumber}>{row.sectionNumber}</span>
      )
    },
    {
      key: 'col-title',
      name: 'Section',
      fieldName: 'sectionTitle',
      minWidth: 120,
      maxWidth: 180,
      isResizable: true,
      onRender: (row: IMatrixRow) => (
        <span style={{ fontWeight: 600, fontSize: 13 }}>{row.sectionTitle}</span>
      )
    },
    {
      key: 'col-req',
      name: 'Required',
      fieldName: 'required',
      minWidth: 70,
      maxWidth: 90,
      isResizable: false,
      onRender: (row: IMatrixRow) => (
        row.required
          ? <span className={styles.requiredBadge}>Required</span>
          : <span className={styles.optionalBadge}>Optional</span>
      )
    },
    {
      key: 'col-status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 90,
      maxWidth: 120,
      isResizable: true,
      onRender: (row: IMatrixRow) => renderStatusBadge(row.status)
    },
    {
      key: 'col-link',
      name: 'Document',
      fieldName: 'url',
      minWidth: 90,
      maxWidth: 120,
      isResizable: true,
      onRender: (row: IMatrixRow) =>
        row.url ? (
          <Link href={row.url} target='_blank' rel='noopener noreferrer' aria-label={`Open ${row.sectionTitle} document`}>
            View Doc
          </Link>
        ) : (
          <span style={{ color: '#a80000', fontSize: 12 }}>No document</span>
        )
    },
    {
      key: 'col-date',
      name: 'Last Modified',
      fieldName: 'lastUpdated',
      minWidth: 90,
      maxWidth: 110,
      isResizable: true,
      onRender: (row: IMatrixRow) => (
        <span style={{ fontSize: 12, color: '#323130' }}>{formatDate(row.lastUpdated)}</span>
      )
    },
    {
      key: 'col-owner',
      name: 'Owner',
      fieldName: 'owner',
      minWidth: 100,
      maxWidth: 160,
      isResizable: true,
      onRender: (row: IMatrixRow) => (
        <span style={{ fontSize: 12, color: '#323130' }}>{row.owner || app.owner || '—'}</span>
      )
    },
    {
      key: 'col-review',
      name: 'Review Status',
      fieldName: 'reviewStatus',
      minWidth: 110,
      maxWidth: 160,
      isResizable: true,
      onRender: (row: IMatrixRow) => (
        <span style={{ fontSize: 12, color: '#323130' }}>{row.reviewStatus}</span>
      )
    },
    {
      key: 'col-action',
      name: 'Action Needed',
      fieldName: 'action',
      minWidth: 140,
      maxWidth: 220,
      isResizable: true,
      onRender: (row: IMatrixRow) => renderAction(row.action)
    }
  ];

  return (
    <div className={styles.wrapper}>
      {/* Summary statistics */}
      <SummaryBar rows={rows} totalRequired={totalRequired} />

      {/* Legend */}
      <ul className={styles.legend} aria-label='Documentation status legend'>
        {LEGEND_STATUSES.map(s => {
          const cfg = DOC_STATUS_CONFIG[s];
          return (
            <li key={s} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{ background: cfg.background, border: `1px solid ${cfg.color}` }}
                aria-hidden
              />
              {cfg.label}
            </li>
          );
        })}
      </ul>

      {/* Matrix grid */}
      <Stack tokens={{ childrenGap: 4 }}>
        <Text variant='small' styles={{ root: { color: '#605e5c', marginBottom: 4 } }}>
          {rows.length} sections · {app.name}
        </Text>
        <DetailsList
          items={rows}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          isHeaderVisible
          ariaLabel={`Documentation matrix for ${app.name}`}
          ariaLabelForGrid={`Documentation matrix for ${app.name}`}
          compact
          getKey={(row: IMatrixRow) => row.key}
        />
      </Stack>
    </div>
  );
};

export default DocumentMatrix;
