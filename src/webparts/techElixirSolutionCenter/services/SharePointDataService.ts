import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import {
  IApplication,
  IArchitectureDoc,
  IReleaseNote,
  ITechnicalDebtItem,
  IAccessibilityCheck,
  AccessibilityCheckStatus,
  AccessibilityImpactArea,
  ArchitectureAssetType,
  ArchitectureCategory,
  AppStatus
} from '../models';
import { IDocument, IIntegration } from '../models/IMockDataTypes';
import { DocumentationStatus, Environment } from '../constants';

interface IListNames {
  solutions: string;
  documents: string;
  releases: string;
  technicalDebt: string;
  architectureAssets: string;
  integrations: string;
  accessibilityChecks: string;
}

const DEFAULT_LIST_NAMES: IListNames = {
  solutions: 'Solution Registry',
  documents: 'Solution Documents',
  releases: 'Solution Releases',
  technicalDebt: 'Solution Technical Debt',
  architectureAssets: 'Solution Architecture Assets',
  integrations: 'Solution Integrations',
  accessibilityChecks: 'Solution Accessibility Checks'
};

export class SharePointDataService {
  private _sp: SPFI;

  private readonly _lists: IListNames;

  constructor(context: WebPartContext, listNames?: Partial<IListNames>) {
    this._sp = spfi().using(SPFx(context));
    this._lists = { ...DEFAULT_LIST_NAMES, ...listNames };
  }

  public async getSolutions(): Promise<IApplication[]> {
    try {
      const items = await this._readListItems(this._lists.solutions, [
        'Id',
        'Title',
        'ShortName',
        'Description',
        'AppType',
        'SolutionStatus',
        'AppStatus',
        'Owner',
        'AppOwner',
        'DocCompleteness',
        'GithubRepoUrl',
        'Tags'
      ]);

      return items.map((item: any) => this._mapSolution(item));
    } catch (error) {
      throw this._buildServiceError('getSolutions', this._lists.solutions, error);
    }
  }

  public async getDocuments(solutionId: string): Promise<IDocument[]> {
    try {
      const items = await this._readListItems(this._lists.documents, [
        'Id',
        'Title',
        'SolutionId',
        'AppId',
        'SectionKey',
        'SectionNumber',
        'SectionTitle',
        'Status',
        'Url',
        'LastUpdated',
        'Owner',
        'Notes'
      ]);

      return items
        .filter((item: any) => this._matchesSolution(item, solutionId))
        .map((item: any) => this._mapDocument(item, solutionId));
    } catch (error) {
      throw this._buildServiceError('getDocuments', this._lists.documents, error);
    }
  }

  public async getReleases(solutionId: string): Promise<IReleaseNote[]> {
    try {
      const items = await this._readListItems(this._lists.releases, [
        'Id',
        'Title',
        'SolutionId',
        'AppId',
        'Version',
        'Date',
        'ReleaseDate',
        'ReleaseType',
        'Summary',
        'Changes',
        'DocumentationChanges',
        'GithubReleaseUrl',
        'DeploymentStatus',
        'ReleaseOwner',
        'KnownIssues'
      ]);

      return items
        .filter((item: any) => this._matchesSolution(item, solutionId))
        .map((item: any) => this._mapRelease(item));
    } catch (error) {
      throw this._buildServiceError('getReleases', this._lists.releases, error);
    }
  }

  public async getTechnicalDebt(solutionId: string): Promise<ITechnicalDebtItem[]> {
    try {
      const items = await this._readListItems(this._lists.technicalDebt, [
        'Id',
        'Title',
        'SolutionId',
        'AppId',
        'Description',
        'Category',
        'Severity',
        'Impact',
        'SuggestedRemediation',
        'Owner',
        'TargetRelease',
        'Status',
        'CreatedDate',
        'LastUpdatedDate'
      ]);

      return items
        .filter((item: any) => this._matchesSolution(item, solutionId))
        .map((item: any) => this._mapTechnicalDebt(item));
    } catch (error) {
      throw this._buildServiceError('getTechnicalDebt', this._lists.technicalDebt, error);
    }
  }

  public async getArchitectureAssets(solutionId: string): Promise<IArchitectureDoc[]> {
    try {
      const items = await this._readListItems(this._lists.architectureAssets, [
        'Id',
        'Title',
        'SolutionId',
        'AppId',
        'Url',
        'AssetType',
        'Description',
        'Version',
        'LastUpdated',
        'Owner',
        'PreviewAvailable',
        'PreviewUrl',
        'Category'
      ]);

      return items
        .filter((item: any) => this._matchesSolution(item, solutionId))
        .map((item: any) => this._mapArchitectureAsset(item));
    } catch (error) {
      throw this._buildServiceError('getArchitectureAssets', this._lists.architectureAssets, error);
    }
  }

  public async getIntegrations(solutionId: string): Promise<IIntegration[]> {
    try {
      const items = await this._readListItems(this._lists.integrations, [
        'Id',
        'Title',
        'SolutionId',
        'AppId',
        'Name',
        'SystemType',
        'Direction',
        'AuthenticationType',
        'DataClassification',
        'Url',
        'DocumentationUrl',
        'Notes',
        'Environment',
        'Status',
        'Owner'
      ]);

      return items
        .filter((item: any) => this._matchesSolution(item, solutionId))
        .map((item: any) => this._mapIntegration(item, solutionId));
    } catch (error) {
      throw this._buildServiceError('getIntegrations', this._lists.integrations, error);
    }
  }

  public async getAccessibilityChecks(solutionId: string): Promise<IAccessibilityCheck[]> {
    try {
      const items = await this._readListItems(this._lists.accessibilityChecks, [
        'Id',
        'Title',
        'SolutionId',
        'AppId',
        'Requirement',
        'WcagReference',
        'Status',
        'ImpactArea',
        'Notes',
        'RemediationGuidance',
        'Owner',
        'TargetDate',
        'RelatedDocumentUrl'
      ]);

      return items
        .filter((item: any) => this._matchesSolution(item, solutionId))
        .map((item: any) => this._mapAccessibilityCheck(item));
    } catch (error) {
      throw this._buildServiceError('getAccessibilityChecks', this._lists.accessibilityChecks, error);
    }
  }

  private async _readListItems(listTitle: string, selectFields: string[]): Promise<any[]> {
    try {
      return await this._sp.web.lists
        .getByTitle(listTitle)
        .items
        .select(...selectFields)();
    } catch (error) {
      throw this._buildServiceError('_readListItems', listTitle, error);
    }
  }

  private _matchesSolution(item: any, solutionId: string): boolean {
    const candidate = this._firstDefined(item.SolutionId, item.AppId);
    return String(candidate || '') === solutionId;
  }

  private _mapSolution(item: any): IApplication {
    const status = this._toAppStatus(this._firstDefined(item.SolutionStatus, item.AppStatus, item.Status));

    return {
      id: String(item.Id),
      name: this._toString(item.Title, 'Untitled Solution'),
      shortName: this._toString(item.ShortName),
      description: this._toString(item.Description),
      appType: this._toString(item.AppType),
      status,
      owner: this._toString(this._firstDefined(item.Owner, item.AppOwner), 'Unassigned'),
      docCompleteness: this._toNumber(item.DocCompleteness, 0),
      architectureDocs: [],
      releaseNotes: [],
      githubRepoUrl: this._toUrl(item.GithubRepoUrl),
      powerPlatformComponents: [],
      technicalDebt: [],
      accessibilityItems: [],
      securityStatus: {
        threatModelComplete: 'NotStarted',
        dataClassificationComplete: 'NotStarted',
        securityReviewComplete: 'NotStarted',
        privacyImpactAssessment: 'NotStarted'
      },
      quickLinks: [],
      tags: this._toStringArray(item.Tags)
    };
  }

  private _mapDocument(item: any, solutionId: string): IDocument {
    return {
      id: String(item.Id),
      appId: this._toString(this._firstDefined(item.AppId, item.SolutionId), solutionId),
      sectionKey: this._toString(item.SectionKey),
      sectionNumber: this._toString(item.SectionNumber),
      sectionTitle: this._toString(this._firstDefined(item.SectionTitle, item.Title), 'Untitled Section'),
      status: this._toDocumentationStatus(item.Status),
      url: this._toUrl(item.Url),
      lastUpdated: this._toDateString(item.LastUpdated),
      owner: this._toString(item.Owner),
      notes: this._toString(item.Notes)
    };
  }

  private _mapRelease(item: any): IReleaseNote {
    return {
      version: this._toString(this._firstDefined(item.Version, item.Title), 'Unversioned'),
      date: this._toDateString(this._firstDefined(item.ReleaseDate, item.Date), new Date(0).toISOString()),
      releaseType: this._toReleaseType(item.ReleaseType),
      summary: this._toString(item.Summary),
      changes: this._toStringArray(item.Changes),
      documentationChanges: this._toStringArray(item.DocumentationChanges),
      githubReleaseUrl: this._toUrl(item.GithubReleaseUrl),
      deploymentStatus: this._toDeploymentStatus(item.DeploymentStatus),
      releaseOwner: this._toString(item.ReleaseOwner),
      knownIssues: this._toStringArray(item.KnownIssues)
    };
  }

  private _mapTechnicalDebt(item: any): ITechnicalDebtItem {
    return {
      id: String(item.Id),
      title: this._toString(this._firstDefined(item.Title, item.Id), 'Technical debt item'),
      description: this._toString(item.Description),
      category: this._toDebtCategory(item.Category),
      severity: this._toDebtSeverity(item.Severity),
      impact: this._toString(item.Impact),
      suggestedRemediation: this._toString(item.SuggestedRemediation),
      owner: this._toString(item.Owner, 'Unassigned'),
      targetRelease: this._toString(item.TargetRelease, 'TBD'),
      status: this._toDebtStatus(item.Status),
      createdDate: this._toDateString(item.CreatedDate, new Date(0).toISOString()),
      lastUpdatedDate: this._toDateString(item.LastUpdatedDate, new Date(0).toISOString())
    };
  }

  private _mapArchitectureAsset(item: any): IArchitectureDoc {
    return {
      title: this._toString(this._firstDefined(item.Title, item.Id), 'Untitled Asset'),
      url: this._toUrl(item.Url, ''),
      assetType: this._toArchitectureAssetType(item.AssetType),
      description: this._toString(item.Description),
      version: this._toString(item.Version),
      lastUpdated: this._toDateString(item.LastUpdated),
      owner: this._toString(item.Owner),
      previewAvailable: Boolean(item.PreviewAvailable),
      previewUrl: this._toUrl(item.PreviewUrl),
      category: this._toArchitectureCategory(item.Category)
    };
  }

  private _mapIntegration(item: any, solutionId: string): IIntegration {
    return {
      id: String(item.Id),
      appId: this._toString(this._firstDefined(item.AppId, item.SolutionId), solutionId),
      name: this._toString(this._firstDefined(item.Name, item.Title), 'Unnamed Integration'),
      systemType: this._toIntegrationSystemType(item.SystemType),
      direction: this._toIntegrationDirection(item.Direction),
      authenticationType: this._toIntegrationAuthType(item.AuthenticationType),
      dataClassification: this._toIntegrationDataClassification(item.DataClassification),
      url: this._toUrl(item.Url),
      documentationUrl: this._toUrl(item.DocumentationUrl),
      notes: this._toString(item.Notes),
      environment: this._toEnvironment(item.Environment),
      status: this._toIntegrationStatus(item.Status),
      owner: this._toString(item.Owner)
    };
  }

  private _mapAccessibilityCheck(item: any): IAccessibilityCheck {
    return {
      id: String(item.Id),
      requirement: this._toString(this._firstDefined(item.Requirement, item.Title), 'Untitled accessibility check'),
      wcagReference: this._toString(item.WcagReference),
      status: this._toAccessibilityStatus(item.Status),
      impactArea: this._toAccessibilityImpactArea(item.ImpactArea),
      notes: this._toString(item.Notes),
      remediationGuidance: this._toString(item.RemediationGuidance),
      owner: this._toString(item.Owner),
      targetDate: this._toDateString(item.TargetDate),
      relatedDocumentUrl: this._toUrl(item.RelatedDocumentUrl)
    };
  }

  private _toString(value: any, fallback = ''): string {
    return typeof value === 'string' ? value : value != null ? String(value) : fallback;
  }

  private _toNumber(value: any, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private _toStringArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.map(v => this._toString(v)).filter(v => v.length > 0);
    }

    if (typeof value === 'string') {
      return value
        .split(';')
        .map(v => v.trim())
        .filter(v => v.length > 0);
    }

    return [];
  }

  private _toDateString(value: any, fallback?: string): string {
    if (!value && fallback) {
      return fallback;
    }

    if (!value) {
      return '';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? (fallback || '') : date.toISOString();
  }

  private _toUrl(value: any, fallback?: string): string {
    if (typeof value === 'string') {
      return value;
    }

    if (value && typeof value === 'object') {
      const url = value.Url || value.url;
      if (typeof url === 'string') {
        return url;
      }
    }

    return fallback || '';
  }

  private _toAppStatus(value: any): AppStatus {
    const allowed: AppStatus[] = ['Active', 'InDevelopment', 'Deprecated', 'Planned'];
    return this._isAllowed(value, allowed, 'Planned');
  }

  private _toDocumentationStatus(value: any): DocumentationStatus {
    const allowed: DocumentationStatus[] = [
      DocumentationStatus.Missing,
      DocumentationStatus.Draft,
      DocumentationStatus.InReview,
      DocumentationStatus.Approved,
      DocumentationStatus.Current,
      DocumentationStatus.Outdated
    ];

    return this._isAllowed(value, allowed, DocumentationStatus.Missing);
  }

  private _toReleaseType(value: any): IReleaseNote['releaseType'] {
    const allowed: NonNullable<IReleaseNote['releaseType']>[] = [
      'Major',
      'Minor',
      'Patch',
      'Hotfix',
      'Beta',
      'Preview',
      'GeneralAvailability'
    ];

    return this._isAllowed(value, allowed, undefined);
  }

  private _toDeploymentStatus(value: any): IReleaseNote['deploymentStatus'] {
    const allowed: NonNullable<IReleaseNote['deploymentStatus']>[] = [
      'Deployed',
      'InProgress',
      'Planned',
      'RolledBack',
      'Failed'
    ];

    return this._isAllowed(value, allowed, undefined);
  }

  private _toDebtCategory(value: any): ITechnicalDebtItem['category'] {
    const allowed: ITechnicalDebtItem['category'][] = [
      'Architecture',
      'Security',
      'Accessibility',
      'Performance',
      'Documentation',
      'Maintainability',
      'Power Platform',
      'SharePoint',
      'DevOps'
    ];

    return this._isAllowed(value, allowed, 'Maintainability');
  }

  private _toDebtSeverity(value: any): ITechnicalDebtItem['severity'] {
    const allowed: ITechnicalDebtItem['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
    return this._isAllowed(value, allowed, 'Medium');
  }

  private _toDebtStatus(value: any): ITechnicalDebtItem['status'] {
    const allowed: ITechnicalDebtItem['status'][] = ['Open', 'InProgress', 'Resolved'];
    return this._isAllowed(value, allowed, 'Open');
  }

  private _toArchitectureAssetType(value: any): ArchitectureAssetType | undefined {
    const allowed: ArchitectureAssetType[] = [
      'SVG',
      'PNG',
      'JPG',
      'PDF',
      'VSDX',
      'Draw.io',
      'Markdown',
      'Word document',
      'PowerPoint'
    ];

    return this._isAllowed(value, allowed, undefined);
  }

  private _toArchitectureCategory(value: any): ArchitectureCategory | undefined {
    const allowed: ArchitectureCategory[] = [
      'Current State',
      'Future State',
      'Data Flow',
      'Security',
      'Integration',
      'Network',
      'Power Platform',
      'Deployment'
    ];

    return this._isAllowed(value, allowed, undefined);
  }

  private _toIntegrationSystemType(value: any): IIntegration['systemType'] {
    const allowed: IIntegration['systemType'][] = [
      'SharePoint',
      'Dataverse',
      'Power Automate',
      'Power Apps',
      'Copilot Studio',
      'Azure Function',
      'Azure SQL',
      'GitHub',
      'Microsoft Graph',
      'External API',
      'On-premises System'
    ];

    return this._isAllowed(value, allowed, 'External API');
  }

  private _toIntegrationDirection(value: any): IIntegration['direction'] {
    const allowed: IIntegration['direction'][] = ['Inbound', 'Outbound', 'Bidirectional'];
    return this._isAllowed(value, allowed, 'Bidirectional');
  }

  private _toIntegrationAuthType(value: any): IIntegration['authenticationType'] {
    const allowed: IIntegration['authenticationType'][] = [
      'None',
      'API Key',
      'OAuth 2.0',
      'Managed Identity',
      'Service Principal',
      'Basic',
      'Certificate',
      'Windows Integrated'
    ];

    return this._isAllowed(value, allowed, 'None');
  }

  private _toIntegrationDataClassification(value: any): IIntegration['dataClassification'] {
    const allowed: IIntegration['dataClassification'][] = ['Public', 'Internal', 'Confidential', 'Restricted'];
    return this._isAllowed(value, allowed, 'Internal');
  }

  private _toIntegrationStatus(value: any): IIntegration['status'] {
    const allowed: IIntegration['status'][] = ['Active', 'Degraded', 'Inactive', 'Planned'];
    return this._isAllowed(value, allowed, 'Planned');
  }

  private _toEnvironment(value: any): Environment {
    const allowed: Environment[] = [
      Environment.Development,
      Environment.Test,
      Environment.UAT,
      Environment.Production
    ];

    return this._isAllowed(value, allowed, Environment.Development);
  }

  private _toAccessibilityStatus(value: any): AccessibilityCheckStatus {
    const allowed: AccessibilityCheckStatus[] = ['Pass', 'NeedsAttention', 'Blocked', 'NotReviewed'];
    return this._isAllowed(value, allowed, 'NotReviewed');
  }

  private _toAccessibilityImpactArea(value: any): AccessibilityImpactArea {
    const allowed: AccessibilityImpactArea[] = [
      'Visual',
      'Auditory',
      'Mobility',
      'Cognitive',
      'Keyboard Navigation',
      'Screen Reader',
      'Color Contrast',
      'Motion Sensitivity'
    ];

    return this._isAllowed(value, allowed, 'Visual');
  }

  private _isAllowed<T extends string>(value: any, allowed: ReadonlyArray<T>, fallback: T): T;
  private _isAllowed<T extends string>(value: any, allowed: ReadonlyArray<T>, fallback: undefined): T | undefined;
  private _isAllowed<T extends string>(value: any, allowed: ReadonlyArray<T>, fallback: T | undefined): T | undefined {
    const raw = this._toString(value);
    return (allowed as ReadonlyArray<string>).indexOf(raw) >= 0 ? (raw as T) : fallback;
  }

  private _firstDefined(...values: any[]): any {
    for (const value of values) {
      if (value !== undefined && value !== null) {
        return value;
      }
    }

    return undefined;
  }

  private _buildServiceError(methodName: string, listName: string, error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(`[SharePointDataService.${methodName}] Failed to read list "${listName}": ${message}`);
  }
}
