import * as React from 'react';
import {
  Stack,
  Text,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Link,
  Icon
} from '@fluentui/react';
import { IApplication, IPowerPlatformComponent } from '../../models';
import { sanitizeUrl } from '../../utils/urlUtils';

interface IPowerPlatformRefsProps {
  app: IApplication;
}

const TYPE_ICONS: Record<string, string> = {
  PowerApp: 'PowerApps',
  PowerAutomate: 'Flow',
  Connector: 'PlugConnected',
  Dataverse: 'Database',
  Other: 'Puzzle'
};

export const PowerPlatformRefs: React.FC<IPowerPlatformRefsProps> = ({ app }) => {
  if (!app.powerPlatformComponents || app.powerPlatformComponents.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Power Platform Components</Text>
        <Text variant='small' styles={{ root: { color: '#a19f9d' } }}>No Power Platform components registered.</Text>
      </Stack>
    );
  }

  const columns: IColumn[] = [
    {
      key: 'type',
      name: 'Type',
      minWidth: 80,
      maxWidth: 120,
      onRender: (item: IPowerPlatformComponent) => (
        <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 6 }}>
          <Icon
            iconName={TYPE_ICONS[item.type] || 'Puzzle'}
            styles={{ root: { color: '#742774', fontSize: 16 } }}
            aria-hidden
          />
          <Text variant='small'>{item.type}</Text>
        </Stack>
      )
    },
    {
      key: 'name',
      name: 'Name',
      minWidth: 160,
      maxWidth: 280,
      onRender: (item: IPowerPlatformComponent) =>
        item.url ? (
          <Link href={sanitizeUrl(item.url)} target='_blank' rel='noopener noreferrer' styles={{ root: { fontSize: 13 } }}>
            {item.name}
          </Link>
        ) : (
          <Text variant='small'>{item.name}</Text>
        )
    },
    {
      key: 'description',
      name: 'Description',
      minWidth: 200,
      isMultiline: true,
      onRender: (item: IPowerPlatformComponent) => (
        <Text variant='small' styles={{ root: { color: '#605e5c' } }}>{item.description || '—'}</Text>
      )
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Power Platform Components</Text>
      <DetailsList
        items={app.powerPlatformComponents}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible={true}
        compact
        ariaLabel={`${app.name} Power Platform components`}
      />
    </Stack>
  );
};
