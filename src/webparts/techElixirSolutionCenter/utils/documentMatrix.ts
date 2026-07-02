import { DocumentationStatus, IDocumentationSection } from '../constants';
import { IDocument } from '../models/IMockDataTypes';

export interface IMatrixRow {
  key: string;
  sectionNumber: string;
  sectionTitle: string;
  required: boolean;
  status: DocumentationStatus;
  url: string | undefined;
  lastUpdated: string | undefined;
  owner: string | undefined;
  reviewStatus: string;
  action: string;
  notes: string | undefined;
}

export const DOCUMENT_LEGEND_STATUSES: ReadonlyArray<DocumentationStatus> = [
  DocumentationStatus.Current,
  DocumentationStatus.Approved,
  DocumentationStatus.InReview,
  DocumentationStatus.Draft,
  DocumentationStatus.Outdated,
  DocumentationStatus.Missing
];

export function deriveDocumentReviewStatus(status: DocumentationStatus): string {
  switch (status) {
    case DocumentationStatus.Current:
      return 'Reviewed & Current';
    case DocumentationStatus.Approved:
      return 'Reviewed & Approved';
    case DocumentationStatus.InReview:
      return 'In Review';
    case DocumentationStatus.Draft:
      return 'Pending Review';
    case DocumentationStatus.Outdated:
      return 'Review Needed';
    case DocumentationStatus.Missing:
      return 'Not Reviewed';
    default:
      return 'Unknown';
  }
}

export function deriveDocumentAction(status: DocumentationStatus, required: boolean): string {
  switch (status) {
    case DocumentationStatus.Missing:
      return required ? 'Create document (required)' : 'Create document';
    case DocumentationStatus.Draft:
      return 'Submit for review';
    case DocumentationStatus.InReview:
      return 'Complete review';
    case DocumentationStatus.Outdated:
      return 'Update & re-submit';
    default:
      return '';
  }
}

export function formatDocumentDate(dateText: string | undefined): string {
  if (!dateText) {
    return '—';
  }

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function buildDocumentMatrixRows(
  sections: ReadonlyArray<IDocumentationSection>,
  documents: ReadonlyArray<IDocument>
): IMatrixRow[] {
  return sections.map(section => {
    const doc = documents.find(item => item.sectionKey === section.key);
    const status = doc ? doc.status : DocumentationStatus.Missing;

    return {
      key: section.key,
      sectionNumber: section.number,
      sectionTitle: section.title,
      required: section.required,
      status,
      url: doc?.url,
      lastUpdated: doc?.lastUpdated,
      owner: doc?.owner,
      reviewStatus: deriveDocumentReviewStatus(status),
      action: deriveDocumentAction(status, section.required),
      notes: doc?.notes
    };
  });
}
