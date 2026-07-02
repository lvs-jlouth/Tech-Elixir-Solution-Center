import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Stack,
  Text
} from '@fluentui/react';

import { IApplication, ITechnicalDebtItem } from '../../models';
import {
  TECHNICAL_DEBT_SEVERITY_APPEARANCE,
  TECHNICAL_DEBT_STATUS_APPEARANCE
} from '../../utils/statusPresentation';
import { StatusBadge } from '../StatusBadge/StatusBadge';

interface ITechnicalDebtProps {
  app: IApplication;
}

function SeverityBadge({ severity }: { severity: ITechnicalDebtItem['severity'] }): JSX.Element {
  return <StatusBadge {...TECHNICAL_DEBT_SEVERITY_APPEARANCE[severity]} ariaLabel={`Severity: ${severity}`} />;
}

function DebtStatusBadge({ status }: { status: ITechnicalDebtItem['status'] }): JSX.Element {
  return <StatusBadge {...TECHNICAL_DEBT_STATUS_APPEARANCE[status]} ariaLabel={`Status: ${status}`} />;
}

export const TechnicalDebt: React.FC<ITechnicalDebtProps> = ({ app }) => {
  if (app.technicalDebt.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Technical Debt
        </Text>
        <Text variant="small" styles={{ root: { color: '#107c10' } }}>
          ✓ No tracked technical debt items.
        </Text>
      </Stack>
    );
  }

  const openCount = app.technicalDebt.filter(item => item.status !== 'Resolved').length;

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
          <Text variant="small" styles={{ root: { fontWeight: 600 } }}>
            {item.title}
          </Text>
          <Text variant="tiny" styles={{ root: { color: '#605e5c' } }}>
            {item.id} · {item.createdDate}
          </Text>
        </Stack>
      )
    },
    {
      key: 'description',
      name: 'Description',
      minWidth: 200,
      isMultiline: true,
      onRender: (item: ITechnicalDebtItem) => (
        <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
          {item.description}
        </Text>
      )
    },
    {
      key: 'status',
      name: 'Status',
      minWidth: 80,
      maxWidth: 110,
      onRender: (item: ITechnicalDebtItem) => <DebtStatusBadge status={item.status} />
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Technical Debt
        </Text>
        {openCount > 0 && (
          <StatusBadge background="#fde7e9" color="#a80000" label={`${openCount} open`} ariaLabel={`${openCount} open debt items`} />
        )}
      </Stack>
      <DetailsList
        items={app.technicalDebt}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible
        compact
        ariaLabel={`${app.name} technical debt items`}
      />
    </Stack>
  );
};
