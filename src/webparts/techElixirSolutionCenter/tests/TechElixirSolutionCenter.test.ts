import { mockApps } from '../data/mockApps';
import { IApplication } from '../models';

// ---------------------------------------------------------------------------
// Model sanity tests
// ---------------------------------------------------------------------------

describe('mockApps data integrity', () => {
  it('contains at least four applications', () => {
    expect(mockApps.length).toBeGreaterThanOrEqual(4);
  });

  it('every app has a unique id', () => {
    const ids = mockApps.map(a => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every app has a non-empty name', () => {
    mockApps.forEach(app => {
      expect(app.name).toBeTruthy();
    });
  });

  it('docCompleteness is between 0 and 100', () => {
    mockApps.forEach(app => {
      expect(app.docCompleteness).toBeGreaterThanOrEqual(0);
      expect(app.docCompleteness).toBeLessThanOrEqual(100);
    });
  });

  it('every app has a valid status', () => {
    const validStatuses = ['Active', 'InDevelopment', 'Deprecated', 'Planned'];
    mockApps.forEach(app => {
      expect(validStatuses).toContain(app.status);
    });
  });

  it('securityStatus has all required fields', () => {
    const requiredFields = [
      'threatModelComplete',
      'dataClassificationComplete',
      'securityReviewComplete',
      'privacyImpactAssessment'
    ];
    mockApps.forEach(app => {
      requiredFields.forEach(field => {
        expect(app.securityStatus).toHaveProperty(field);
      });
    });
  });

  it('Finance Elixir app has the expected structure', () => {
    const financeApp = mockApps.find(a => a.name === 'Finance Elixir');
    expect(financeApp).toBeDefined();
    if (financeApp) {
      expect(financeApp.owner).toBe('Finance Team');
      expect(financeApp.githubRepoUrl).toContain('finance-elixir');
      expect(financeApp.architectureDocs.length).toBeGreaterThanOrEqual(1);
      expect(financeApp.releaseNotes.length).toBeGreaterThanOrEqual(1);
      expect(financeApp.technicalDebt.length).toBeGreaterThanOrEqual(1);
      expect(financeApp.accessibilityItems.length).toBeGreaterThanOrEqual(1);
      expect(financeApp.quickLinks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('Script Elixir has critical technical debt items', () => {
    const scriptApp = mockApps.find(a => a.name === 'Script Elixir');
    expect(scriptApp).toBeDefined();
    if (scriptApp) {
      const criticalItems = scriptApp.technicalDebt.filter(d => d.severity === 'Critical');
      expect(criticalItems.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// AppDataService tests (mock data path)
// ---------------------------------------------------------------------------

jest.mock('@pnp/sp', () => ({
  spfi: jest.fn(),
  SPFx: jest.fn()
}));

jest.mock('@pnp/sp/webs', () => ({}));
jest.mock('@pnp/sp/lists', () => ({}));
jest.mock('@pnp/sp/items', () => ({}));

import { AppDataService } from '../services/AppDataService';

const mockContext: any = {
  pageContext: { web: { absoluteUrl: 'https://example.sharepoint.com' } }
};

describe('AppDataService (mock data mode)', () => {
  let service: AppDataService;

  beforeEach(() => {
    service = new AppDataService(mockContext, '');
  });

  it('returns all mock apps when no list name is provided', async () => {
    const apps = await service.getApplications();
    expect(apps.length).toBe(mockApps.length);
  });

  it('getApplicationById returns correct app', async () => {
    const app = await service.getApplicationById('1');
    expect(app).toBeDefined();
    expect(app!.name).toBe('Finance Elixir');
  });

  it('getApplicationById returns undefined for unknown id', async () => {
    const app = await service.getApplicationById('9999');
    expect(app).toBeUndefined();
  });

  it('searchApplications filters by name', async () => {
    const results = await service.searchApplications('finance');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => {
      expect(r.name.toLowerCase()).toContain('finance');
    });
  });

  it('searchApplications returns all apps for empty query', async () => {
    const results = await service.searchApplications('');
    expect(results.length).toBe(mockApps.length);
  });

  it('searchApplications filters by tag', async () => {
    const results = await service.searchApplications('Wellness');
    expect(results.some(r => r.name === 'Fitness Elixir')).toBe(true);
  });
});
