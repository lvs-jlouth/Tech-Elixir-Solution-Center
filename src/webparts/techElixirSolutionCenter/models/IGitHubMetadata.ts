/**
 * Metadata fetched from GitHub for a linked repository.
 * All fields are optional — they are populated by an IGitHubService implementation
 * and are undefined when the service has not been called or the data is unavailable.
 */
export interface IGitHubMetadata {
  /** URL of the GitHub repository (e.g. https://github.com/org/repo) */
  repositoryUrl?: string;
  /** Default branch name (e.g. "main") */
  defaultBranch?: string;
  /** Commit message of the most recent commit on the default branch */
  latestCommitMessage?: string;
  /** ISO date string of the most recent commit */
  latestCommitDate?: string;
  /** Number of open issues in the repository */
  openIssuesCount?: number;
  /** Number of open pull requests in the repository */
  openPullRequestsCount?: number;
  /** Tag name of the latest GitHub release (e.g. "v1.4.2") */
  latestReleaseVersion?: string;
  /** ISO date string of the latest GitHub release */
  latestReleaseDate?: string;
}
