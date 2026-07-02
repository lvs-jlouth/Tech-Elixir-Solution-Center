import * as React from 'react';
import { Stack, Text, Link } from '@fluentui/react';
import { IApplication, IReleaseNote } from '../../models';
import { formatDisplayDate, sortReleasesByDate } from '../../utils/solutionDisplay';
import { RELEASE_DEPLOYMENT_APPEARANCE } from '../../utils/statusPresentation';
import { sanitizeUrl } from '../../utils/urlUtils';
import { StatusBadge } from '../StatusBadge/StatusBadge';

interface IReleaseTimelineProps {
  app: IApplication;
}

function renderListOrFallback(items: string[] | undefined, fallback: string): JSX.Element {
  if (!items || items.length === 0) {
    return <Text variant="small">{fallback}</Text>;
  }

  return (
    <ul style={{ margin: 0, paddingLeft: 20 }}>
      {items.map((item, index) => (
        <li key={index}>
          <Text variant="small">{item}</Text>
        </li>
      ))}
    </ul>
  );
}

export const ReleaseTimeline: React.FC<IReleaseTimelineProps> = ({ app }) => {
  const sortedReleases = React.useMemo(
    () => sortReleasesByDate(app.releaseNotes || []),
    [app.releaseNotes]
  );

  if (sortedReleases.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>Release Timeline</Text>
        <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
          No releases available.
        </Text>
      </Stack>
    );
  }

  return (
    <section aria-labelledby={`release-timeline-heading-${app.id}`}>
      <Text
        id={`release-timeline-heading-${app.id}`}
        variant="mediumPlus"
        styles={{ root: { fontWeight: 600, display: 'block', marginBottom: 12 } }}
      >
        Release Timeline
      </Text>

      <ol style={{ margin: 0, paddingLeft: 20 }} aria-label={`${app.name} releases in newest first order`}>
        {sortedReleases.map((release, index) => {
        const deployment = release.deploymentStatus
          ? RELEASE_DEPLOYMENT_APPEARANCE[release.deploymentStatus]
          : undefined;

          return (
            <li key={`${release.version}-${release.date}-${index}`} style={{ marginBottom: 18 }}>
              <article aria-label={`Release ${release.version} from ${release.date}`}>
                <Stack tokens={{ childrenGap: 8 }} styles={{ root: { border: '1px solid #edebe9', borderRadius: 4, padding: 12 } }}>
                  <Stack horizontal wrap tokens={{ childrenGap: 10 }} verticalAlign="center">
                    <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
                      Version {release.version}
                    </Text>
                    <Text variant="small">Date: <time dateTime={release.date}>{formatDisplayDate(release.date)}</time></Text>
                  </Stack>

                  <dl style={{ margin: 0 }}>
                    <dt><Text variant="smallPlus" styles={{ root: { fontWeight: 600 } }}>Release Type</Text></dt>
                    <dd style={{ margin: '2px 0 8px' }}>
                      <Text variant="small">{release.releaseType || 'Not specified'}</Text>
                    </dd>

                    <dt><Text variant="smallPlus" styles={{ root: { fontWeight: 600 } }}>Summary</Text></dt>
                    <dd style={{ margin: '2px 0 8px' }}>
                      <Text variant="small">{release.summary}</Text>
                    </dd>

                    <dt><Text variant="smallPlus" styles={{ root: { fontWeight: 600 } }}>Related Documentation Changes</Text></dt>
                    <dd style={{ margin: '2px 0 8px' }}>
                      {renderListOrFallback(release.documentationChanges, 'No documentation changes listed.')}
                    </dd>

                    <dt><Text variant="smallPlus" styles={{ root: { fontWeight: 600 } }}>GitHub Release</Text></dt>
                    <dd style={{ margin: '2px 0 8px' }}>
                      {release.githubReleaseUrl ? (
                        <Link href={sanitizeUrl(release.githubReleaseUrl)} target="_blank" rel="noopener noreferrer">
                          Open GitHub release
                        </Link>
                      ) : (
                        <Text variant="small">Not provided</Text>
                      )}
                    </dd>

                    <dt><Text variant="smallPlus" styles={{ root: { fontWeight: 600 } }}>Deployment Status</Text></dt>
                    <dd style={{ margin: '2px 0 8px' }}>
                      {deployment ? (
                        <StatusBadge {...deployment} ariaLabel={`Deployment status: ${deployment.label}`} />
                      ) : (
                        <Text variant="small">Not specified</Text>
                      )}
                    </dd>

                    <dt><Text variant="smallPlus" styles={{ root: { fontWeight: 600 } }}>Release Owner</Text></dt>
                    <dd style={{ margin: '2px 0 8px' }}>
                      <Text variant="small">{release.releaseOwner || 'Not specified'}</Text>
                    </dd>

                    <dt><Text variant="smallPlus" styles={{ root: { fontWeight: 600 } }}>Known Issues</Text></dt>
                    <dd style={{ margin: '2px 0 0' }}>
                      {renderListOrFallback(release.knownIssues, 'No known issues reported.')}
                    </dd>
                  </dl>
                </Stack>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
