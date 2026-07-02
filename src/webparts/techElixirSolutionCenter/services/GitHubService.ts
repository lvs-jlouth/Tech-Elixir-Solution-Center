import { IGitHubMetadata } from '../models/IGitHubMetadata';
import {
  IGitHubIssue,
  IGitHubPullRequest,
  IGitHubRelease,
  IGitHubService
} from './IGitHubService';

interface IParsedRepository {
  owner: string;
  repository: string;
  normalizedRepositoryUrl: string;
}

/**
 * Optional server-side integration contract.
 * Implement this later with an Azure Function, API Management endpoint,
 * or another tenant-approved connector that manages the GitHub token.
 */
export interface IGitHubServerConnector {
  getRepositoryMetadata(owner: string, repository: string): Promise<IGitHubMetadata>;
  getLatestRelease(owner: string, repository: string): Promise<IGitHubRelease | undefined>;
  getOpenIssues(owner: string, repository: string): Promise<IGitHubIssue[]>;
  getOpenPullRequests(owner: string, repository: string): Promise<IGitHubPullRequest[]>;
}

export class GitHubServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubServiceError';
  }
}

/**
 * GitHub service skeleton for future secure integration.
 * No token handling is implemented in this client-side class.
 */
export class GitHubService implements IGitHubService {
  constructor(private readonly _serverConnector?: IGitHubServerConnector) {}

  public async getRepositoryMetadata(repositoryUrl: string): Promise<IGitHubMetadata> {
    try {
      const parsed = this._parseRepositoryUrl(repositoryUrl);
      const baseline: IGitHubMetadata = {
        repositoryUrl: parsed.normalizedRepositoryUrl
      };

      if (!this._serverConnector) {
        return baseline;
      }

      const metadata = await this._serverConnector.getRepositoryMetadata(parsed.owner, parsed.repository);
      return {
        ...metadata,
        repositoryUrl: metadata.repositoryUrl || parsed.normalizedRepositoryUrl
      };
    } catch (error) {
      throw this._toSafeError('getRepositoryMetadata', error);
    }
  }

  public async getLatestRelease(repositoryUrl: string): Promise<IGitHubRelease | undefined> {
    try {
      const parsed = this._parseRepositoryUrl(repositoryUrl);
      if (!this._serverConnector) {
        return undefined;
      }

      return this._serverConnector.getLatestRelease(parsed.owner, parsed.repository);
    } catch (error) {
      throw this._toSafeError('getLatestRelease', error);
    }
  }

  public async getOpenIssues(repositoryUrl: string): Promise<IGitHubIssue[]> {
    try {
      const parsed = this._parseRepositoryUrl(repositoryUrl);
      if (!this._serverConnector) {
        return [];
      }

      return this._serverConnector.getOpenIssues(parsed.owner, parsed.repository);
    } catch (error) {
      throw this._toSafeError('getOpenIssues', error);
    }
  }

  public async getOpenPullRequests(repositoryUrl: string): Promise<IGitHubPullRequest[]> {
    try {
      const parsed = this._parseRepositoryUrl(repositoryUrl);
      if (!this._serverConnector) {
        return [];
      }

      return this._serverConnector.getOpenPullRequests(parsed.owner, parsed.repository);
    } catch (error) {
      throw this._toSafeError('getOpenPullRequests', error);
    }
  }

  private _parseRepositoryUrl(repositoryUrl: string): IParsedRepository {
    if (!repositoryUrl || !repositoryUrl.trim()) {
      throw new GitHubServiceError('Repository URL is required.');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(repositoryUrl);
    } catch {
      throw new GitHubServiceError('Repository URL is invalid.');
    }

    if (parsedUrl.hostname.toLowerCase() !== 'github.com') {
      throw new GitHubServiceError('Only github.com repository URLs are supported.');
    }

    const parts = parsedUrl.pathname
      .split('/')
      .map(part => part.trim())
      .filter(part => part.length > 0);

    if (parts.length < 2) {
      throw new GitHubServiceError('Repository URL must include owner and repository name.');
    }

    const owner = parts[0];
    const repository = parts[1].replace(/\.git$/i, '');
    const normalizedRepositoryUrl = `https://github.com/${owner}/${repository}`;

    return { owner, repository, normalizedRepositoryUrl };
  }

  private _toSafeError(methodName: string, error: unknown): GitHubServiceError {
    if (error instanceof GitHubServiceError) {
      return error;
    }

    return new GitHubServiceError(`Failed to complete ${methodName}.`);
  }
}
