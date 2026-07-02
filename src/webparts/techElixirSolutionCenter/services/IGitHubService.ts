import { IGitHubMetadata } from '../models/IGitHubMetadata';

/**
 * Contract for a service that retrieves GitHub repository metadata.
 * Implement this interface and pass it to AppDetailPanel.githubService
 * to connect live GitHub data to the GitHubMetadataSection component.
 */
export interface IGitHubService {
  /**
   * Fetch GitHub metadata for the given repository URL.
   * @param repositoryUrl - The full URL to the GitHub repository.
   */
  getMetadata(repositoryUrl: string): Promise<IGitHubMetadata>;
}
