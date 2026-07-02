import * as React from 'react';
import { Icon, Link } from '@fluentui/react';
import { IGitHubMetadata } from '../../models/IGitHubMetadata';
import { sanitizeUrl } from '../../utils/urlUtils';
import styles from './GitHubMetadataSection.module.scss';

interface IGitHubMetadataSectionProps {
  /** GitHub repository URL taken from the application record. */
  repositoryUrl: string | undefined;
  /**
   * Metadata fetched by an IGitHubService implementation.
   * When undefined (default), every field renders a "—" placeholder,
   * making it safe to render before the service is wired up.
   */
  metadata?: IGitHubMetadata;
}

/** Formats an ISO date string to a human-readable short date, or returns a fallback. */
function formatDate(iso: string | undefined, fallback: string): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Renders a single metadata row inside the section. */
function MetaRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className={styles.metaRow}>
      <Icon iconName={icon} className={styles.metaIcon} aria-hidden />
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{children}</span>
    </div>
  );
}

/**
 * Displays a summary of GitHub repository metadata for a solution.
 *
 * While the metadata prop is undefined the component renders placeholder dashes
 * for every field so the UI layout is stable before a real IGitHubService is
 * connected.  Pass a populated IGitHubMetadata object (obtained from an
 * IGitHubService implementation) to show live data.
 */
export const GitHubMetadataSection: React.FC<IGitHubMetadataSectionProps> = ({
  repositoryUrl,
  metadata
}) => {
  const repoUrl = metadata?.repositoryUrl ?? repositoryUrl;
  const na = '—';

  return (
    <section aria-labelledby="github-meta-heading" className={styles.section}>
      <div className={styles.sectionHeader}>
        <Icon iconName="CodeEdit" className={styles.sectionIcon} aria-hidden />
        <h3 id="github-meta-heading" className={styles.sectionTitle}>GitHub Repository</h3>
        {repoUrl && (
          <Link
            href={sanitizeUrl(repoUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.repoLink}
            aria-label="Open GitHub repository in new tab"
          >
            Open repo
            <Icon iconName="OpenInNewWindow" className={styles.externalIcon} aria-hidden />
          </Link>
        )}
      </div>

      {!repoUrl && !metadata && (
        <p className={styles.noRepoNote}>No GitHub repository linked for this solution.</p>
      )}

      <dl className={styles.metaGrid}>
        {/* Repository info */}
        <MetaRow icon="BranchShaded" label="Default branch">
          {metadata?.defaultBranch ?? na}
        </MetaRow>

        {/* Latest commit */}
        <MetaRow icon="CodeCommit" label="Latest commit">
          {metadata?.latestCommitMessage
            ? <span className={styles.commitMessage} title={metadata.latestCommitMessage}>
                {metadata.latestCommitMessage.length > 72
                  ? `${metadata.latestCommitMessage.substring(0, 72)}…`
                  : metadata.latestCommitMessage}
              </span>
            : na}
        </MetaRow>
        <MetaRow icon="EventDate" label="Commit date">
          {formatDate(metadata?.latestCommitDate, na)}
        </MetaRow>

        {/* Open activity */}
        <MetaRow icon="WorkItem" label="Open issues">
          {metadata?.openIssuesCount !== undefined
            ? String(metadata.openIssuesCount)
            : na}
        </MetaRow>
        <MetaRow icon="BranchMerge" label="Open pull requests">
          {metadata?.openPullRequestsCount !== undefined
            ? String(metadata.openPullRequestsCount)
            : na}
        </MetaRow>

        {/* Latest release */}
        <MetaRow icon="ReleaseGate" label="Latest release">
          {metadata?.latestReleaseVersion ?? na}
        </MetaRow>
        <MetaRow icon="Calendar" label="Release date">
          {formatDate(metadata?.latestReleaseDate, na)}
        </MetaRow>
      </dl>
    </section>
  );
};
