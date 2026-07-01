import * as React from 'react';
import { Stack, Text, Link, Icon } from '@fluentui/react';
import { IApplication, IArchitectureDoc, ArchitectureAssetType } from '../../models';

interface IArchitectureAssetsProps {
  app: IApplication;
}

const IMAGE_TYPES: ArchitectureAssetType[] = ['SVG', 'PNG', 'JPG'];

function inferAssetType(doc: IArchitectureDoc): ArchitectureAssetType | 'Unknown' {
  if (doc.assetType) {
    return doc.assetType;
  }

  const lowerUrl = (doc.url || '').toLowerCase();
  if (lowerUrl.endsWith('.svg')) return 'SVG';
  if (lowerUrl.endsWith('.png')) return 'PNG';
  if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) return 'JPG';
  if (lowerUrl.endsWith('.pdf')) return 'PDF';
  if (lowerUrl.endsWith('.vsdx')) return 'VSDX';
  if (lowerUrl.endsWith('.drawio') || lowerUrl.endsWith('.dio')) return 'Draw.io';
  if (lowerUrl.endsWith('.md') || lowerUrl.endsWith('.markdown')) return 'Markdown';
  if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) return 'Word document';
  if (lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx')) return 'PowerPoint';
  return 'Unknown';
}

function getAssetIcon(assetType: ArchitectureAssetType | 'Unknown'): string {
  if (assetType === 'PDF') return 'PDF';
  if (assetType === 'Word document') return 'WordDocument';
  if (assetType === 'PowerPoint') return 'PowerPointDocument';
  if (assetType === 'Markdown') return 'FileCode';
  if (assetType === 'VSDX') return 'VisioDiagram';
  if (assetType === 'Draw.io') return 'Design';
  if (IMAGE_TYPES.indexOf(assetType as ArchitectureAssetType) >= 0) return 'Photo2';
  return 'Documentation';
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
        const assetType = inferAssetType(doc);
        const isImage = IMAGE_TYPES.indexOf(assetType as ArchitectureAssetType) >= 0;
        const previewUrl = doc.previewUrl || (isImage ? doc.url : undefined);
        const previewAvailable = !!previewUrl || !!doc.previewAvailable;

        return (
          <Stack
            key={`${doc.title}-${idx}`}
            tokens={{ childrenGap: 10 }}
            styles={{ root: { padding: '10px', border: '1px solid #edebe9', borderRadius: 4 } }}
          >
            <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 8 }}>
              <Icon iconName={getAssetIcon(assetType)} styles={{ root: { color: '#0078d4', fontSize: 18 } }} aria-hidden />
              <Text variant='medium' styles={{ root: { fontWeight: 600 } }}>{doc.title}</Text>
            </Stack>

            {previewUrl && isImage && (
              <img
                src={previewUrl}
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
                <Link href={doc.url} target='_blank' rel='noopener noreferrer'>
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
