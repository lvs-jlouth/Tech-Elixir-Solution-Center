import { ArchitectureAssetType, IArchitectureDoc } from '../models';

export type ResolvedArchitectureAssetType = ArchitectureAssetType | 'Unknown';

const IMAGE_ASSET_TYPES: ReadonlyArray<ArchitectureAssetType> = ['SVG', 'PNG', 'JPG'];

export function inferArchitectureAssetType(doc: IArchitectureDoc): ResolvedArchitectureAssetType {
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

export function isImageArchitectureAssetType(assetType: ResolvedArchitectureAssetType): boolean {
  return IMAGE_ASSET_TYPES.indexOf(assetType as ArchitectureAssetType) >= 0;
}

export function getArchitectureAssetIcon(assetType: ResolvedArchitectureAssetType): string {
  if (assetType === 'PDF') return 'PDF';
  if (assetType === 'Word document') return 'WordDocument';
  if (assetType === 'PowerPoint') return 'PowerPointDocument';
  if (assetType === 'Markdown') return 'FileCode';
  if (assetType === 'VSDX') return 'VisioDiagram';
  if (assetType === 'Draw.io') return 'Design';
  if (isImageArchitectureAssetType(assetType)) return 'Photo2';
  return 'Documentation';
}
