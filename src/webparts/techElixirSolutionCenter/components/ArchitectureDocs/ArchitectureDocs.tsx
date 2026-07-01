import * as React from 'react';
import { Stack, Text, Link, Icon } from '@fluentui/react';
import { IApplication } from '../../models';

interface IArchitectureDocsProps {
  app: IApplication;
}

export const ArchitectureDocs: React.FC<IArchitectureDocsProps> = ({ app }) => {
  if (!app.architectureDocs || app.architectureDocs.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Architecture Documents</Text>
        <Text variant='small' styles={{ root: { color: '#a19f9d' } }}>No architecture documents available.</Text>
      </Stack>
    );
  }

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Architecture Documents</Text>
      {app.architectureDocs.map((doc, idx) => (
        <Stack
          key={idx}
          horizontal
          verticalAlign='start'
          tokens={{ childrenGap: 10 }}
          styles={{ root: { padding: '8px', border: '1px solid #edebe9', borderRadius: 4 } }}
        >
          <Icon iconName='Documentation' styles={{ root: { fontSize: 20, color: '#0078d4', marginTop: 2 } }} />
          <Stack tokens={{ childrenGap: 2 }}>
            <Link href={doc.url} target='_blank' rel='noopener noreferrer'>
              {doc.title}
            </Link>
            {doc.description && (
              <Text variant='small' styles={{ root: { color: '#605e5c' } }}>{doc.description}</Text>
            )}
            {doc.lastUpdated && (
              <Text variant='tiny' styles={{ root: { color: '#a19f9d' } }}>Last updated: {doc.lastUpdated}</Text>
            )}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};
