import * as React from 'react';
import { Stack, Text, Link, Icon } from '@fluentui/react';
import { IApplication } from '../../models';
import {
  getArchitectureAssetIcon,
  inferArchitectureAssetType,
  isImageArchitectureAssetType
} from '../../utils/architectureAssets';
import { sanitizeUrl } from '../../utils/urlUtils';

interface IArchitectureAssetsProps {
  app: IApplication;
}

export const ArchitectureAssets: React.FC<IArchitectureAssetsProps> = ({ app }) => {
  if (!app.architectureDocs || app.architectureDocs.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Architecture Assets</Text>
        <Text variant='small' styles={{ root: { color: '#a19f9d' } }}>No architecture assets available.</Text>
      </Stack>
    );
  }

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Architecture Assets</Text>
      {app.architectureDocs.map((doc, idx) => {
        const assetType = inferArchitectureAssetType(doc);
        const isImage = isImageArchitectureAssetType(assetType);
        const previewUrl = doc.previewUrl || (isImage ? doc.url : undefined);
        const previewAvailable = !!previewUrl || !!doc.previewAvailable;

        return (
          <Stack
            key={`${doc.title}-${idx}`}
            tokens={{ childrenGap: 10 }}
            styles={{ root: { padding: '10px', border: '1px solid #edebe9', borderRadius: 4 } }}
          >
            <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 8 }}>
              <Icon iconName={getArchitectureAssetIcon(assetType)} styles={{ root: { color: '#0078d4', fontSize: 18 } }} aria-hidden />
              <Text variant='medium' styles={{ root: { fontWeight: 600 } }}>{doc.title}</Text>
            </Stack>

            {previewUrl && isImage && (
              <img
                src={sanitizeUrl(previewUrl)}
                alt={`${doc.title} preview thumbnail`}
                style={{ width: 180, height: 110, objectFit: 'cover', borderRadius: 4, border: '1px solid #edebe9' }}
              />
            )}

            <Stack tokens={{ childrenGap: 2 }}>
              <Text variant='small'><strong>Asset type:</strong> {assetType}</Text>
              <Text variant='small'><strong>Description:</strong> {doc.description || '—'}</Text>
              <Text variant='small'><strong>Version:</strong> {doc.version || '—'}</Text>
              <Text variant='small'><strong>Last updated:</strong> {doc.lastUpdated || '—'}</Text>
              <Text variant='small'><strong>Owner:</strong> {doc.owner || '—'}</Text>
              <Text variant='small'><strong>Architecture category:</strong> {doc.category || '—'}</Text>
              <Text variant='small'><strong>Preview available:</strong> {previewAvailable ? 'Yes' : 'No'}</Text>
              <Text variant='small'>
                <strong>Document URL:</strong>{' '}
                <Link href={sanitizeUrl(doc.url)} target='_blank' rel='noopener noreferrer'>
                  {previewAvailable && isImage ? 'Open full document' : 'Open / Download'}
                </Link>
              </Text>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
};
