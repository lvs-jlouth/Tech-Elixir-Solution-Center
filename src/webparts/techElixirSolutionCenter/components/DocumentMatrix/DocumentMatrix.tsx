/**
 * DocumentMatrix.tsx
 *
 * Renders an accessible table-like matrix of documentation sections for a
 * given solution application.
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

import { IDocumentationSection, DocumentationStatus } from '../../constants';
import { IApplication } from '../../models/IApplication';
import { IDocument } from '../../models/IMockDataTypes';
import {
  buildDocumentMatrixRows,
  DOCUMENT_LEGEND_STATUSES,
  formatDocumentDate,
  IMatrixRow
} from '../../utils/documentMatrix';
import { DOCUMENT_STATUS_APPEARANCE } from '../../utils/statusPresentation';
import { sanitizeUrl } from '../../utils/urlUtils';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import styles from './DocumentMatrix.module.scss';

export interface IDocumentMatrixProps {
  app: IApplication;
  documents: IDocument[];
  sections: ReadonlyArray<IDocumentationSection>;
}

function renderStatusBadge(status: DocumentationStatus): JSX.Element {
  const appearance = DOCUMENT_STATUS_APPEARANCE[status];
  return <StatusBadge {...appearance} ariaLabel={`Status: ${appearance.label}`} />;
}

function renderAction(action: string): JSX.Element {
  if (!action) {
    return <span className={styles.actionNone}>No action needed</span>;
  }

  return (
    <span className={styles.actionChip} aria-label={`Action: ${action}`}>
      <Icon iconName="TaskSolid" aria-hidden styles={{ root: { fontSize: 10 } }} />
      {action}
    </span>
  );
}

const SummaryBar: React.FC<{ rows: IMatrixRow[]; totalRequired: number }> = ({ rows, totalRequired }) => {
  const totalSections = rows.length;
  const missing = rows.filter(row => row.status === DocumentationStatus.Missing).length;
  const complete = rows.filter(row => row.status === DocumentationStatus.Current || row.status === DocumentationStatus.Approved).length;
  const actionsNeeded = rows.filter(row => row.action !== '').length;
  const requiredMissing = rows.filter(row => row.required && row.status === DocumentationStatus.Missing).length;

  const stats: Array<{ value: string; label: string; accent?: string }> = [
    { value: `${complete}/${totalSections}`, label: 'Complete' },
    { value: String(missing), label: 'Missing', accent: missing > 0 ? '#a80000' : undefined },
    { value: String(requiredMissing), label: 'Required Missing', accent: requiredMissing > 0 ? '#a80000' : undefined },
    { value: String(actionsNeeded), label: 'Actions Needed', accent: actionsNeeded > 0 ? '#8a5700' : undefined },
    { value: String(totalRequired), label: 'Required Sections' }
  ];

  return (
    <div className={styles.summaryBar} role="region" aria-label="Documentation completeness summary">
      {stats.map(stat => (
        <div key={stat.label} className={styles.summaryStat}>
          <span className={styles.summaryValue} style={stat.accent ? { color: stat.accent } : undefined}>
            {stat.value}
          </span>
          <span className={styles.summaryLabel}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export const DocumentMatrix: React.FC<IDocumentMatrixProps> = ({ app, documents, sections }) => {
  const rows = React.useMemo(() => buildDocumentMatrixRows(sections, documents), [sections, documents]);
  const totalRequired = React.useMemo(() => sections.filter(section => section.required).length, [sections]);

  const columns: IColumn[] = [
    {
      key: 'col-num',
      name: '#',
      fieldName: 'sectionNumber',
      minWidth: 28,
      maxWidth: 36,
      isResizable: false,
      onRender: (row: IMatrixRow) => <span className={styles.sectionNumber}>{row.sectionNumber}</span>
    },
    {
      key: 'col-title',
      name: 'Section',
      fieldName: 'sectionTitle',
      minWidth: 190,
      maxWidth: 260,
      isMultiline: true,
      onRender: (row: IMatrixRow) => (
        <Stack tokens={{ childrenGap: 2 }}>
          <span className={styles.sectionTitle}>{row.sectionTitle}</span>
          <span className={styles.sectionMeta}>{row.required ? 'Required' : 'Optional'}</span>
        </Stack>
      )
    },
    {
      key: 'col-status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 120,
      maxWidth: 140,
      onRender: (row: IMatrixRow) => renderStatusBadge(row.status)
    },
    {
      key: 'col-link',
      name: 'Document',
      fieldName: 'url',
      minWidth: 150,
      maxWidth: 180,
      onRender: (row: IMatrixRow) =>
        row.url ? (
          <Link href={sanitizeUrl(row.url)} target="_blank" rel="noopener noreferrer">
            Open document
          </Link>
        ) : (
          <span className={styles.mutedText}>—</span>
        )
    },
    {
      key: 'col-date',
      name: 'Last Updated',
      fieldName: 'lastUpdated',
      minWidth: 105,
      maxWidth: 125,
      onRender: (row: IMatrixRow) => <span>{formatDocumentDate(row.lastUpdated)}</span>
    },
    {
      key: 'col-owner',
      name: 'Owner',
      fieldName: 'owner',
      minWidth: 110,
      maxWidth: 150,
      onRender: (row: IMatrixRow) => <span>{row.owner || '—'}</span>
    },
    {
      key: 'col-review',
      name: 'Review Status',
      fieldName: 'reviewStatus',
      minWidth: 130,
      maxWidth: 160,
      onRender: (row: IMatrixRow) => <span>{row.reviewStatus}</span>
    },
    {
      key: 'col-action',
      name: 'Action Needed',
      fieldName: 'action',
      minWidth: 140,
      maxWidth: 180,
      onRender: (row: IMatrixRow) => renderAction(row.action)
    },
    {
      key: 'col-notes',
      name: 'Notes',
      fieldName: 'notes',
      minWidth: 160,
      isMultiline: true,
      onRender: (row: IMatrixRow) => <span className={styles.notesText}>{row.notes || '—'}</span>
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 16 }} aria-label={`${app.name} documentation matrix`}>
      <SummaryBar rows={rows} totalRequired={totalRequired} />

      <div className={styles.legend} role="list" aria-label="Documentation status legend">
        {DOCUMENT_LEGEND_STATUSES.map(status => {
          const appearance = DOCUMENT_STATUS_APPEARANCE[status];
          return (
            <div key={status} className={styles.legendItem} role="listitem">
              {renderStatusBadge(status)}
              <Text variant="small">{appearance.label}</Text>
            </div>
          );
        })}
      </div>

      <DetailsList
        items={rows}
        columns={columns}
        compact={false}
        selectionMode={SelectionMode.none}
        layoutMode={DetailsListLayoutMode.justified}
        setKey="documentation-matrix"
        ariaLabel={`${app.name} documentation matrix table`}
      />
    </Stack>
  );
};

export default DocumentMatrix;
