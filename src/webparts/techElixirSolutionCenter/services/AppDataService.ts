import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IApplication } from '../models';
import { mockApps } from '../data/mockApps';

export class AppDataService {
  private _sp: SPFI;
  private _listName: string;
  private _useMockData: boolean;

  constructor(context: WebPartContext, listName: string) {
    this._listName = listName ? listName.trim() : '';
    this._useMockData = !this._listName;

    if (!this._useMockData) {
      this._sp = spfi().using(SPFx(context));
    }
  }

  /**
   * Returns all applications from either the configured SharePoint list or mock data.
   * Falls back to mock data if the list call fails.
   */
  public async getApplications(): Promise<IApplication[]> {
    if (this._useMockData) {
      return Promise.resolve(mockApps);
    }

    try {
      const items = await this._sp.web.lists
        .getByTitle(this._listName)
        .items
        .select(
          'Id',
          'Title',
          'Description',
          'AppStatus',
          'AppOwner',
          'DocCompleteness',
          'GithubRepoUrl',
          'Tags'
        )();

      return items.map((item: any) => {
        // Attempt to find a matching mock app to back-fill complex fields not stored in the list
        const mockApp = mockApps.find(a => a.name === item.Title) || mockApps[0];
        return {
          ...mockApp,
          id: String(item.Id),
          name: item.Title || mockApp.name,
          description: item.Description || mockApp.description,
          status: item.AppStatus || mockApp.status,
          owner: item.AppOwner || mockApp.owner,
          docCompleteness: typeof item.DocCompleteness === 'number' ? item.DocCompleteness : mockApp.docCompleteness,
          githubRepoUrl: item.GithubRepoUrl || mockApp.githubRepoUrl,
          tags: item.Tags ? item.Tags.split(';').map((t: string) => t.trim()) : mockApp.tags
        };
      });
    } catch (error) {
      console.warn(
        `[AppDataService] Could not read from list "${this._listName}". Falling back to mock data.`,
        error
      );
      return mockApps;
    }
  }

  /**
   * Returns a single application by its id, or undefined if not found.
   */
  public async getApplicationById(id: string): Promise<IApplication | undefined> {
    const apps = await this.getApplications();
    return apps.find(a => a.id === id);
  }

  /**
   * Returns applications filtered by a search term (name or tags).
   */
  public async searchApplications(query: string): Promise<IApplication[]> {
    const apps = await this.getApplications();
    if (!query || !query.trim()) {
      return apps;
    }
    const lower = query.toLowerCase();
    return apps.filter(
      a =>
        a.name.toLowerCase().includes(lower) ||
        (a.description && a.description.toLowerCase().includes(lower)) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(lower)))
    );
  }
}
