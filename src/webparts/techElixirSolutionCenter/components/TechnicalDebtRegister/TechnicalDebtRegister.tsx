import * as React from 'react';
import {
  Stack,
  Text,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Dropdown,
  IDropdownOption
} from '@fluentui/react';
import { IApplication, ITechnicalDebtItem } from '../../models';

interface ITechnicalDebtRegisterProps {
  app: IApplication;
}

const CATEGORY_OPTIONS: IDropdownOption[] = [
  { key: 'All', text: 'All categories' },
  { key: 'Architecture', text: 'Architecture' },
  { key: 'Security', text: 'Security' },
  { key: 'Accessibility', text: 'Accessibility' },
  { key: 'Performance', text: 'Performance' },
  { key: 'Documentation', text: 'Documentation' },
  { key: 'Maintainability', text: 'Maintainability' },
  { key: 'Power Platform', text: 'Power Platform' },
  { key: 'SharePoint', text: 'SharePoint' },
  { key: 'DevOps', text: 'DevOps' }
];

const SEVERITY_OPTIONS: IDropdownOption[] = [
  { key: 'All', text: 'All severities' },
  { key: 'Critical', text: 'Critical' },
  { key: 'High', text: 'High' },
  { key: 'Medium', text: 'Medium' },
  { key: 'Low', text: 'Low' }
];

const STATUS_OPTIONS: IDropdownOption[] = [
  { key: 'All', text: 'All statuses' },
  { key: 'Open', text: 'Open' },
  { key: 'InProgress', text: 'In Progress' },
  { key: 'Resolved', text: 'Resolved' }
];

function StatusText(status: string): string {
  return status === 'InProgress' ? 'In Progress' : status;
}

export const TechnicalDebtRegister: React.FC<ITechnicalDebtRegisterProps> = ({ app }) => {
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>('All');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('All');

  const filteredItems = React.useMemo(
    () =>
      (app.technicalDebt || []).filter(item =>
        (selectedSeverity === 'All' || item.severity === selectedSeverity) &&
        (selectedCategory === 'All' || item.category === selectedCategory) &&
        (selectedStatus === 'All' || item.status === selectedStatus)
      ),
    [app.technicalDebt, selectedSeverity, selectedCategory, selectedStatus]
  );

  if (!app.technicalDebt || app.technicalDebt.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>Technical Debt Register</Text>
        <Text variant="small">No technical debt items tracked for this solution.</Text>
      </Stack>
    );
  }

  const columns: IColumn[] = [
    { key: 'title', name: 'Title', minWidth: 180, maxWidth: 250, onRender: (item: ITechnicalDebtItem) => <Text variant="small" styles={{ root: { fontWeight: 600 } }}>{item.title}</Text> },
    { key: 'description', name: 'Description', minWidth: 220, maxWidth: 320, isMultiline: true, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.description}</Text> },
    { key: 'category', name: 'Category', minWidth: 120, maxWidth: 150, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.category}</Text> },
    { key: 'severity', name: 'Severity', minWidth: 80, maxWidth: 90, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.severity}</Text> },
    { key: 'impact', name: 'Impact', minWidth: 180, maxWidth: 260, isMultiline: true, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.impact}</Text> },
    { key: 'suggestedRemediation', name: 'Suggested Remediation', minWidth: 220, maxWidth: 300, isMultiline: true, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.suggestedRemediation}</Text> },
    { key: 'owner', name: 'Owner', minWidth: 120, maxWidth: 160, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.owner}</Text> },
    { key: 'targetRelease', name: 'Target Release', minWidth: 120, maxWidth: 130, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.targetRelease}</Text> },
    { key: 'status', name: 'Status', minWidth: 95, maxWidth: 105, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{StatusText(item.status)}</Text> },
    { key: 'createdDate', name: 'Created Date', minWidth: 105, maxWidth: 120, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.createdDate}</Text> },
    { key: 'lastUpdatedDate', name: 'Last Updated Date', minWidth: 120, maxWidth: 145, onRender: (item: ITechnicalDebtItem) => <Text variant="small">{item.lastUpdatedDate}</Text> }
  ];

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>Technical Debt Register</Text>

      <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
        <Dropdown
          label="Filter by severity"
          selectedKey={selectedSeverity}
          options={SEVERITY_OPTIONS}
          onChange={(_, option) => setSelectedSeverity(String(option?.key || 'All'))}
          styles={{ dropdown: { width: 220 } }}
        />
        <Dropdown
          label="Filter by category"
          selectedKey={selectedCategory}
          options={CATEGORY_OPTIONS}
          onChange={(_, option) => setSelectedCategory(String(option?.key || 'All'))}
          styles={{ dropdown: { width: 220 } }}
        />
        <Dropdown
          label="Filter by status"
          selectedKey={selectedStatus}
          options={STATUS_OPTIONS}
          onChange={(_, option) => setSelectedStatus(String(option?.key || 'All'))}
          styles={{ dropdown: { width: 220 } }}
        />
      </Stack>

      <Text variant="small" aria-live="polite">
        Showing {filteredItems.length} of {app.technicalDebt.length} item(s)
      </Text>

      <DetailsList
        items={filteredItems}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        compact
        isHeaderVisible
        ariaLabel={`${app.name} technical debt register`}
      />
    </Stack>
  );
};
