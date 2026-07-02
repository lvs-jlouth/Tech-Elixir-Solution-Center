import * as React from 'react';
import {
  Stack,
  Text,
  Link,
  Dropdown,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode
} from '@fluentui/react';
import { IIntegration } from '../../models/IMockDataTypes';
import { buildDistinctOptions } from '../../utils/solutionDisplay';
import { INTEGRATION_STATUS_APPEARANCE } from '../../utils/statusPresentation';
import { sanitizeUrl } from '../../utils/urlUtils';
import { StatusBadge } from '../StatusBadge/StatusBadge';

interface IIntegrationInventoryProps {
  integrations: IIntegration[];
  title?: string;
  emptyMessage?: string;
}

type FilterValue = string | undefined;

const SUPPORTED_SYSTEM_TYPES: ReadonlyArray<IIntegration['systemType']> = [
  'SharePoint',
  'Dataverse',
  'Power Automate',
  'Power Apps',
  'Copilot Studio',
  'Azure Function',
  'Azure SQL',
  'GitHub',
  'Microsoft Graph',
  'External API',
  'On-premises System'
];

export const IntegrationInventory: React.FC<IIntegrationInventoryProps> = ({
  integrations,
  title = 'Integration Inventory',
  emptyMessage = 'No integrations registered for this solution.'
}) => {
  const [systemTypeFilter, setSystemTypeFilter] = React.useState<FilterValue>(undefined);
  const [environmentFilter, setEnvironmentFilter] = React.useState<FilterValue>(undefined);
  const [statusFilter, setStatusFilter] = React.useState<FilterValue>(undefined);
  const [dataClassificationFilter, setDataClassificationFilter] = React.useState<FilterValue>(undefined);

  const systemTypeOptions = React.useMemo(
    () => buildDistinctOptions(SUPPORTED_SYSTEM_TYPES.slice(), '__all__', 'All'),
    []
  );
  const environmentOptions = React.useMemo(
    () => buildDistinctOptions(Array.from(new Set(integrations.map(i => i.environment))), '__all__', 'All'),
    [integrations]
  );
  const statusOptions = React.useMemo(
    () => buildDistinctOptions(Array.from(new Set(integrations.map(i => i.status))), '__all__', 'All'),
    [integrations]
  );
  const dataClassificationOptions = React.useMemo(
    () => buildDistinctOptions(Array.from(new Set(integrations.map(i => i.dataClassification))), '__all__', 'All'),
    [integrations]
  );

  const filtered = React.useMemo(
    () =>
      integrations.filter(i =>
        (!systemTypeFilter || i.systemType === systemTypeFilter) &&
        (!environmentFilter || i.environment === environmentFilter) &&
        (!statusFilter || i.status === statusFilter) &&
        (!dataClassificationFilter || i.dataClassification === dataClassificationFilter)
      ),
    [integrations, systemTypeFilter, environmentFilter, statusFilter, dataClassificationFilter]
  );

  const columns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      minWidth: 150,
      maxWidth: 220,
      onRender: (item: IIntegration) =>
        item.url ? (
          <Link href={sanitizeUrl(item.url)} target='_blank' rel='noopener noreferrer'>{item.name}</Link>
        ) : (
          <Text variant='small'>{item.name}</Text>
        )
    },
    { key: 'systemType', name: 'System Type', minWidth: 110, maxWidth: 150, onRender: (item: IIntegration) => <Text variant='small'>{item.systemType}</Text> },
    { key: 'direction', name: 'Direction', minWidth: 90, maxWidth: 120, onRender: (item: IIntegration) => <Text variant='small'>{item.direction}</Text> },
    { key: 'auth', name: 'Authentication', minWidth: 120, maxWidth: 160, onRender: (item: IIntegration) => <Text variant='small'>{item.authenticationType}</Text> },
    { key: 'classification', name: 'Data Classification', minWidth: 120, maxWidth: 160, onRender: (item: IIntegration) => <Text variant='small'>{item.dataClassification}</Text> },
    { key: 'environment', name: 'Environment', minWidth: 90, maxWidth: 110, onRender: (item: IIntegration) => <Text variant='small'>{item.environment}</Text> },
    { key: 'owner', name: 'Owner', minWidth: 120, maxWidth: 170, onRender: (item: IIntegration) => <Text variant='small'>{item.owner || '—'}</Text> },
    {
      key: 'status',
      name: 'Status',
      minWidth: 90,
      maxWidth: 110,
      onRender: (item: IIntegration) => <StatusBadge {...INTEGRATION_STATUS_APPEARANCE[item.status]} ariaLabel={`Status: ${item.status}`} />
    },
    {
      key: 'documentationUrl',
      name: 'Documentation',
      minWidth: 120,
      maxWidth: 160,
      onRender: (item: IIntegration) =>
        item.documentationUrl ? (
          <Link href={sanitizeUrl(item.documentationUrl)} target='_blank' rel='noopener noreferrer'>Open docs</Link>
        ) : (
          <Text variant='small'>—</Text>
        )
    },
    {
      key: 'notes',
      name: 'Notes',
      minWidth: 170,
      isMultiline: true,
      onRender: (item: IIntegration) => <Text variant='small'>{item.notes || '—'}</Text>
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>{title}</Text>

      <Stack horizontal wrap tokens={{ childrenGap: 10 }} role='group' aria-label='Integration inventory filters'>
        <Dropdown
          label='System type'
          options={systemTypeOptions}
          selectedKey={systemTypeFilter || '__all__'}
          onChange={(_, option) => setSystemTypeFilter(option?.key === '__all__' ? undefined : String(option?.key))}
          styles={{ dropdown: { width: 210 } }}
        />
        <Dropdown
          label='Environment'
          options={environmentOptions}
          selectedKey={environmentFilter || '__all__'}
          onChange={(_, option) => setEnvironmentFilter(option?.key === '__all__' ? undefined : String(option?.key))}
          styles={{ dropdown: { width: 170 } }}
        />
        <Dropdown
          label='Status'
          options={statusOptions}
          selectedKey={statusFilter || '__all__'}
          onChange={(_, option) => setStatusFilter(option?.key === '__all__' ? undefined : String(option?.key))}
          styles={{ dropdown: { width: 170 } }}
        />
        <Dropdown
          label='Data classification'
          options={dataClassificationOptions}
          selectedKey={dataClassificationFilter || '__all__'}
          onChange={(_, option) => setDataClassificationFilter(option?.key === '__all__' ? undefined : String(option?.key))}
          styles={{ dropdown: { width: 210 } }}
        />
      </Stack>

      {filtered.length === 0 ? (
        <Text variant='small' styles={{ root: { color: '#a19f9d' } }}>{emptyMessage}</Text>
      ) : (
        <DetailsList
          items={filtered}
          columns={columns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          compact
          isHeaderVisible
          ariaLabel='Integration inventory list'
        />
      )}
    </Stack>
  );
};
