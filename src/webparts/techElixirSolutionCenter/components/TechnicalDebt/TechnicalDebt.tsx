import * as React from 'react';
import {
  Stack,
  Text,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode
} from '@fluentui/react';
import { IApplication, ITechnicalDebtItem } from '../../models';

interface ITechnicalDebtProps {
  app: IApplication;
}

const SEVERITY_STYLES: Record<string, { background: string; color: string }> = {
  Critical: { background: '#fde7e9', color: '#a80000' },
  High: { background: '#fed9cc', color: '#c43501' },
  Medium: { background: '#fff4ce', color: '#8a5700' },
  Low: { background: '#dff6dd', color: '#107c10' }
};

const STATUS_STYLES: Record<string, { background: string; color: string }> = {
  Open: { background: '#fde7e9', color: '#a80000' },
  InProgress: { background: '#fff4ce', color: '#8a5700' },
  Resolved: { background: '#dff6dd', color: '#107c10' }
};

function SeverityBadge({ severity }: { severity: string }): JSX.Element {
  const s = SEVERITY_STYLES[severity] || { background: '#f3f2f1', color: '#323130' };
  return (
    <span style={{ ...s, borderRadius: 3, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }): JSX.Element {
  const s = STATUS_STYLES[status] || { background: '#f3f2f1', color: '#323130' };
  const label = status === 'InProgress' ? 'In Progress' : status;
  return (
    <span style={{ ...s, borderRadius: 3, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
      {label}
    </span>
  );
}

export const TechnicalDebt: React.FC<ITechnicalDebtProps> = ({ app }) => {
  if (!app.technicalDebt || app.technicalDebt.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Technical Debt</Text>
        <Text variant='small' styles={{ root: { color: '#107c10' } }}>✓ No tracked technical debt items.</Text>
      </Stack>
    );
  }

  const openCount = app.technicalDebt.filter(d => d.status !== 'Resolved').length;

  const columns: IColumn[] = [
    {
      key: 'severity',
      name: 'Severity',
      minWidth: 70,
      maxWidth: 90,
      onRender: (item: ITechnicalDebtItem) => <SeverityBadge severity={item.severity} />
    },
    {
      key: 'title',
      name: 'Title',
      minWidth: 180,
      maxWidth: 300,
      isMultiline: false,
      onRender: (item: ITechnicalDebtItem) => (
        <Stack tokens={{ childrenGap: 2 }}>
          <Text variant='small' styles={{ root: { fontWeight: 600 } }}>{item.title}</Text>
          <Text variant='tiny' styles={{ root: { color: '#605e5c' } }}>{item.id} · {item.createdDate}</Text>
        </Stack>
      )
    },
    {
      key: 'description',
      name: 'Description',
      minWidth: 200,
      isMultiline: true,
      onRender: (item: ITechnicalDebtItem) => (
        <Text variant='small' styles={{ root: { color: '#605e5c' } }}>{item.description}</Text>
      )
    },
    {
      key: 'status',
      name: 'Status',
      minWidth: 80,
      maxWidth: 110,
      onRender: (item: ITechnicalDebtItem) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 10 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Technical Debt</Text>
        {openCount > 0 && (
          <span style={{ background: '#fde7e9', color: '#a80000', borderRadius: 10, padding: '0 8px', fontSize: 12, fontWeight: 600 }}>
            {openCount} open
          </span>
        )}
      </Stack>
      <DetailsList
        items={app.technicalDebt}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible={true}
        compact
      />
    </Stack>
  );
};
