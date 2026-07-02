import { IGitHubMetadata } from '../models/IGitHubMetadata';

/**
 * Contract for a service that retrieves GitHub repository metadata.
 * Implement this interface and pass it to AppDetailPanel.githubService
 * to connect live GitHub data to the GitHubMetadataSection component.
 */
export interface IGitHubService {
  /**
   * Fetch summary metadata for the given repository URL.
   * @param repositoryUrl - The full URL to the GitHub repository.
   */
  getRepositoryMetadata(repositoryUrl: string): Promise<IGitHubMetadata>;

  /**
   * Fetch the latest release details for the given repository URL.
   * Returns undefined when no release is available.
   */
  getLatestRelease(repositoryUrl: string): Promise<IGitHubRelease | undefined>;

  /** Fetch open issues for the given repository URL. */
  getOpenIssues(repositoryUrl: string): Promise<IGitHubIssue[]>;

  /** Fetch open pull requests for the given repository URL. */
  getOpenPullRequests(repositoryUrl: string): Promise<IGitHubPullRequest[]>;
}

export interface IGitHubRelease {
  id: number;
  tagName: string;
  name?: string;
  url?: string;
  publishedAt?: string;
}

export interface IGitHubIssue {
  id: number;
  number: number;
  title: string;
  url: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGitHubPullRequest {
  id: number;
  number: number;
  title: string;
  url: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}
