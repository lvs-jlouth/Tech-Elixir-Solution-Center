/**
 * docCompleteness.ts
 *
 * Utility function that compares DOCUMENTATION_SECTIONS against the IDocument
 * records available for a selected solution and returns a completeness summary.
 */

import { IDocumentationSection, DocumentationStatus } from '../constants';
import { IDocument } from '../models/IMockDataTypes';

/** Completeness summary returned by calculateDocCompleteness. */
export interface IDocCompletenessResult {
  /** Number of sections marked required in DOCUMENTATION_SECTIONS. */
  totalRequired: number;
  /** Number of required sections that have a document with a status other than Missing. */
  completedRequired: number;
  /** Number of required sections whose status is Missing (or have no document record). */
  missingRequired: number;
  /** Number of optional sections that have a document with a status other than Missing. */
  optionalPresent: number;
  /** Percentage of required documents that are complete (0–100, rounded to nearest integer). */
  completenessPercentage: number;
  /** Section keys of required sections that are still missing. */
  missingSectionKeys: string[];
  /** DocumentationStatus keyed by sectionKey for every entry in sections. */
  statusBySection: Record<string, DocumentationStatus>;
}

/**
 * Calculates documentation completeness for a solution.
 *
 * @param sections - The canonical list of expected sections (use DOCUMENTATION_SECTIONS).
 * @param documents - The IDocument records returned by the data service for the solution.
 * @returns An IDocCompletenessResult summary.
 */
export function calculateDocCompleteness(
  sections: ReadonlyArray<IDocumentationSection>,
  documents: IDocument[]
): IDocCompletenessResult {
  // Build a quick lookup from sectionKey → IDocument
  const docByKey = new Map<string, IDocument>();
  for (const doc of documents) {
    docByKey.set(doc.sectionKey, doc);
  }

  let totalRequired = 0;
  let completedRequired = 0;
  let optionalPresent = 0;
  const missingSectionKeys: string[] = [];
  const statusBySection: Record<string, DocumentationStatus> = {};

  for (const section of sections) {
    const doc = docByKey.get(section.key);
    const status: DocumentationStatus = doc ? doc.status : DocumentationStatus.Missing;
    const isMissing = status === DocumentationStatus.Missing;

    statusBySection[section.key] = status;

    if (section.required) {
      totalRequired++;
      if (isMissing) {
        missingSectionKeys.push(section.key);
      } else {
        completedRequired++;
      }
    } else {
      if (!isMissing) {
        optionalPresent++;
      }
    }
  }

  const missingRequired = totalRequired - completedRequired;
  const completenessPercentage =
    totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

  return {
    totalRequired,
    completedRequired,
    missingRequired,
    optionalPresent,
    completenessPercentage,
    missingSectionKeys,
    statusBySection
  };
}
