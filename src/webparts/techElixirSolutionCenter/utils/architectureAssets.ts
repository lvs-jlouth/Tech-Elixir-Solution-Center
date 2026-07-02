import { ArchitectureAssetType, IArchitectureDoc } from '../models';

export type ResolvedArchitectureAssetType = ArchitectureAssetType | 'Unknown';

const IMAGE_ASSET_TYPES: ReadonlyArray<ArchitectureAssetType> = ['SVG', 'PNG', 'JPG'];

function hasSuffix(value: string, suffix: string): boolean {
  return value.slice(-suffix.length) === suffix;
}

export function inferArchitectureAssetType(doc: IArchitectureDoc): ResolvedArchitectureAssetType {
  if (doc.assetType) {
    return doc.assetType;
  }

  const lowerUrl = (doc.url || '').toLowerCase();
  if (hasSuffix(lowerUrl, '.svg')) return 'SVG';
  if (hasSuffix(lowerUrl, '.png')) return 'PNG';
  if (hasSuffix(lowerUrl, '.jpg') || hasSuffix(lowerUrl, '.jpeg')) return 'JPG';
  if (hasSuffix(lowerUrl, '.pdf')) return 'PDF';
  if (hasSuffix(lowerUrl, '.vsdx')) return 'VSDX';
  if (hasSuffix(lowerUrl, '.drawio') || hasSuffix(lowerUrl, '.dio')) return 'Draw.io';
  if (hasSuffix(lowerUrl, '.md') || hasSuffix(lowerUrl, '.markdown')) return 'Markdown';
  if (hasSuffix(lowerUrl, '.doc') || hasSuffix(lowerUrl, '.docx')) return 'Word document';
  if (hasSuffix(lowerUrl, '.ppt') || hasSuffix(lowerUrl, '.pptx')) return 'PowerPoint';
  return 'Unknown';
}

export function isImageArchitectureAssetType(assetType: ResolvedArchitectureAssetType): boolean {
  return IMAGE_ASSET_TYPES.indexOf(assetType) >= 0;
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
