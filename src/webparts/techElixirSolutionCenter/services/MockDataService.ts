/**
 * MockDataService.ts
 *
 * Standalone data-access service that returns realistic mock data for the
 * TechElixirSolutionCenter web part.  All methods are intentionally async
 * (returning Promises) so they can be replaced with real SharePoint / PnPjs
 * calls without changing any calling code.
 *
 * Covered entities
 * ────────────────
 *   getApplications          – all IApplication records
 *   getApplicationById       – single IApplication by id
 *   searchApplications       – name / tag filter
 *   getDocuments             – per-section documentation records for one app
 *   getAllDocuments           – all documentation records
 *   getReleaseNotes          – release history for one app
 *   getTechnicalDebt         – open/in-progress debt items for one app
 *   getArchitectureAssets    – architecture documents for one app
 *   getAccessibilityItems    – WCAG checks for one app
 *   getIntegrations          – external integration records for one app
 *   getAllIntegrations        – all integration records
 *   getHealthSummary         – traffic-light health snapshot for one app
 *   getAllHealthSummaries     – health snapshots for all apps
 */

import {
  IApplication,
  IArchitectureDoc,
  IAccessibilityItem,
  ITechnicalDebtItem,
  IReleaseNote
} from '../models/IApplication';
import { IDocument, IIntegration, IHealthSummary } from '../models/IMockDataTypes';
import {
  MOCK_APPLICATIONS,
  getDocumentsForApp,
  getIntegrationsForApp,
  getHealthSummaryForApp,
  getArchitectureAssetsForApp,
  getReleaseNotesForApp,
  getTechnicalDebtForApp,
  getAccessibilityItemsForApp,
  MOCK_DOCUMENTS,
  MOCK_INTEGRATIONS,
  MOCK_HEALTH_SUMMARIES
} from '../data/mockCatalog';

export class MockDataService {
  // ─────────────────────────────────────────────────────────────────────────
  // Applications
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns all application records.
   * Replace with a SharePoint list query when real data is available.
   */
  public async getApplications(): Promise<IApplication[]> {
    return Promise.resolve([...MOCK_APPLICATIONS]);
  }

  /**
   * Returns a single application by its id, or undefined if not found.
   */
  public async getApplicationById(id: string): Promise<IApplication | undefined> {
    return Promise.resolve(MOCK_APPLICATIONS.find(a => a.id === id));
  }

  /**
   * Returns applications matching the given search term against name, description,
   * and tags.  An empty query returns all applications.
   */
  public async searchApplications(query: string): Promise<IApplication[]> {
    if (!query || !query.trim()) {
      return this.getApplications();
    }
    const lower = query.toLowerCase();
    return Promise.resolve(
      MOCK_APPLICATIONS.filter(
        a =>
          a.name.toLowerCase().includes(lower) ||
          (a.description && a.description.toLowerCase().includes(lower)) ||
          (a.tags && a.tags.some(t => t.toLowerCase().includes(lower)))
      )
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Documents
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns documentation-section records for a single application.
   * Replace with a SharePoint Documents library query when real data is available.
   */
  public async getDocuments(appId: string): Promise<IDocument[]> {
    return Promise.resolve(getDocumentsForApp(appId));
  }

  /**
   * Returns documentation-section records for all applications.
   */
  public async getAllDocuments(): Promise<IDocument[]> {
    return Promise.resolve([...MOCK_DOCUMENTS]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Release notes
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns release notes for a single application, most recent first.
   */
  public async getReleaseNotes(appId: string): Promise<IReleaseNote[]> {
    return Promise.resolve(getReleaseNotesForApp(appId));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Technical debt
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns technical debt items for a single application.
   * Optionally filter to only open / in-progress items by passing
   * `excludeResolved: true`.
   */
  public async getTechnicalDebt(
    appId: string,
    excludeResolved: boolean = false
  ): Promise<ITechnicalDebtItem[]> {
    const items = getTechnicalDebtForApp(appId);
    return Promise.resolve(
      excludeResolved ? items.filter(i => i.status !== 'Resolved') : items
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Architecture assets
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns architecture document records for a single application.
   * Replace with a SharePoint Documents library query when real data is available.
   */
  public async getArchitectureAssets(appId: string): Promise<IArchitectureDoc[]> {
    return Promise.resolve(getArchitectureAssetsForApp(appId));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Accessibility checks
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns WCAG accessibility check items for a single application.
   */
  public async getAccessibilityItems(appId: string): Promise<IAccessibilityItem[]> {
    return Promise.resolve(getAccessibilityItemsForApp(appId));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Integrations
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns external-system integration records for a single application.
   * Replace with a SharePoint Integrations list query when real data is available.
   */
  public async getIntegrations(appId: string): Promise<IIntegration[]> {
    return Promise.resolve(getIntegrationsForApp(appId));
  }

  /**
   * Returns all integration records across all applications.
   */
  public async getAllIntegrations(): Promise<IIntegration[]> {
    return Promise.resolve([...MOCK_INTEGRATIONS]);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Health summaries
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Returns the rolled-up health snapshot for a single application.
   * Returns undefined if no summary is available.
   */
  public async getHealthSummary(appId: string): Promise<IHealthSummary | undefined> {
    return Promise.resolve(getHealthSummaryForApp(appId));
  }

  /**
   * Returns health snapshots for all applications.
   */
  public async getAllHealthSummaries(): Promise<IHealthSummary[]> {
    return Promise.resolve([...MOCK_HEALTH_SUMMARIES]);
  }
}
