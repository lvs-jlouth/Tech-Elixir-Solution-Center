import { calculateDocCompleteness } from '../utils/docCompleteness';
import { DOCUMENTATION_SECTIONS, DocumentationStatus } from '../constants';
import { IDocument } from '../models/IMockDataTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal IDocument record for a given sectionKey and status. */
function makeDoc(
  appId: string,
  sectionKey: string,
  status: DocumentationStatus,
  url?: string
): IDocument {
  const section = DOCUMENTATION_SECTIONS.find(s => s.key === sectionKey)!;
  return {
    id: `${appId}-${sectionKey}`,
    appId,
    sectionKey,
    sectionNumber: section.number,
    sectionTitle: section.title,
    status,
    url
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('calculateDocCompleteness', () => {
  it('returns zero completeness when all documents are empty', () => {
    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, []);

    const expectedRequired = DOCUMENTATION_SECTIONS.filter(s => s.required).length;
    expect(result.totalRequired).toBe(expectedRequired);
    expect(result.completedRequired).toBe(0);
    expect(result.missingRequired).toBe(expectedRequired);
    expect(result.optionalPresent).toBe(0);
    expect(result.completenessPercentage).toBe(0);
    expect(result.missingSectionKeys).toHaveLength(expectedRequired);
  });

  it('returns 100% completeness when all required documents are present and non-missing', () => {
    const docs: IDocument[] = DOCUMENTATION_SECTIONS.filter(s => s.required).map(s =>
      makeDoc('1', s.key, DocumentationStatus.Current)
    );

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    expect(result.completenessPercentage).toBe(100);
    expect(result.completedRequired).toBe(result.totalRequired);
    expect(result.missingRequired).toBe(0);
    expect(result.missingSectionKeys).toHaveLength(0);
  });

  it('counts optional docs as optionalPresent when non-missing', () => {
    const optionalSections = DOCUMENTATION_SECTIONS.filter(s => !s.required);
    const docs: IDocument[] = optionalSections.map(s =>
      makeDoc('1', s.key, DocumentationStatus.Approved)
    );

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    expect(result.optionalPresent).toBe(optionalSections.length);
    expect(result.completedRequired).toBe(0);
  });

  it('does not count optional docs with Missing status as optionalPresent', () => {
    const optionalSections = DOCUMENTATION_SECTIONS.filter(s => !s.required);
    const docs: IDocument[] = optionalSections.map(s =>
      makeDoc('1', s.key, DocumentationStatus.Missing)
    );

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    expect(result.optionalPresent).toBe(0);
  });

  it('treats a required section with Missing status as not completed', () => {
    const requiredSections = DOCUMENTATION_SECTIONS.filter(s => s.required);
    // Provide all required sections as Missing
    const docs: IDocument[] = requiredSections.map(s =>
      makeDoc('1', s.key, DocumentationStatus.Missing)
    );

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    expect(result.completedRequired).toBe(0);
    expect(result.missingRequired).toBe(requiredSections.length);
  });

  it('treats Draft and InReview statuses as completed (not missing)', () => {
    const requiredSections = DOCUMENTATION_SECTIONS.filter(s => s.required);
    const docs: IDocument[] = requiredSections.map((s, i) =>
      makeDoc('1', s.key, i % 2 === 0 ? DocumentationStatus.Draft : DocumentationStatus.InReview)
    );

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    expect(result.completedRequired).toBe(requiredSections.length);
    expect(result.missingRequired).toBe(0);
  });

  it('correctly identifies missing required section keys', () => {
    // Provide all sections except '05-security' and '06-deployment-guide'
    const missedKeys = new Set(['05-security', '06-deployment-guide']);
    const docs: IDocument[] = DOCUMENTATION_SECTIONS.filter(s => !missedKeys.has(s.key)).map(s =>
      makeDoc('1', s.key, DocumentationStatus.Current)
    );

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    // Both missed sections are required
    expect(result.missingSectionKeys).toContain('05-security');
    expect(result.missingSectionKeys).toContain('06-deployment-guide');
    expect(result.missingSectionKeys).toHaveLength(2);
  });

  it('statusBySection maps every DOCUMENTATION_SECTION key to a DocumentationStatus', () => {
    const docs: IDocument[] = [
      makeDoc('1', '00-overview', DocumentationStatus.Current),
      makeDoc('1', '01-architecture', DocumentationStatus.Outdated)
    ];

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    // Keys with document records
    expect(result.statusBySection['00-overview']).toBe(DocumentationStatus.Current);
    expect(result.statusBySection['01-architecture']).toBe(DocumentationStatus.Outdated);

    // Keys without document records should default to Missing
    expect(result.statusBySection['02-data-model']).toBe(DocumentationStatus.Missing);
    expect(result.statusBySection['05-security']).toBe(DocumentationStatus.Missing);

    // All section keys are present
    DOCUMENTATION_SECTIONS.forEach(s => {
      expect(result.statusBySection).toHaveProperty(s.key);
    });
  });

  it('completenessPercentage rounds to the nearest integer', () => {
    // 5 required sections in DOCUMENTATION_SECTIONS (00-overview, 01-architecture,
    // 02-data-model, 05-security, 06-deployment-guide).
    // Completing 4 of 5 = 80%.
    const requiredSections = DOCUMENTATION_SECTIONS.filter(s => s.required);
    const allButOne = requiredSections.slice(0, requiredSections.length - 1);
    const docs: IDocument[] = allButOne.map(s =>
      makeDoc('1', s.key, DocumentationStatus.Current)
    );

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    const expected = Math.round((allButOne.length / requiredSections.length) * 100);
    expect(result.completenessPercentage).toBe(expected);
  });

  it('returns 0% completeness when sections array is empty', () => {
    const result = calculateDocCompleteness([], [
      makeDoc('1', '00-overview', DocumentationStatus.Current)
    ]);

    expect(result.totalRequired).toBe(0);
    expect(result.completenessPercentage).toBe(0);
  });

  it('missingRequired equals totalRequired minus completedRequired', () => {
    const docs: IDocument[] = [
      makeDoc('1', '00-overview',       DocumentationStatus.Current),
      makeDoc('1', '01-architecture',   DocumentationStatus.Current),
      makeDoc('1', '02-data-model',     DocumentationStatus.Missing),
      makeDoc('1', '05-security',       DocumentationStatus.Draft),
      makeDoc('1', '06-deployment-guide', DocumentationStatus.Missing)
    ];

    const result = calculateDocCompleteness(DOCUMENTATION_SECTIONS, docs);

    expect(result.missingRequired).toBe(result.totalRequired - result.completedRequired);
  });
});
