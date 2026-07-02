import * as React from 'react';

import { IApplication, IHealthSummary } from '../../models';
import {
  deriveEnvironment,
  formatDisplayDate,
  getDocBarColor,
  getLatestRelease
} from '../../utils/solutionDisplay';
import {
  APP_STATUS_APPEARANCE,
  getHealthAppearance
} from '../../utils/statusPresentation';
import { HealthIndicator } from '../HealthIndicator/HealthIndicator';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import styles from '../AppOverviewCard/AppOverviewCard.module.scss';

export interface ISolutionCardProps {
  app: IApplication;
  compact?: boolean;
  healthSummary?: IHealthSummary;
  onSelect?: (appId: string) => void;
}

export const SolutionCard: React.FC<ISolutionCardProps> = ({
  app,
  compact,
  healthSummary,
  onSelect
}) => {
  const statusStyle = APP_STATUS_APPEARANCE[app.status];
  const latestRelease = getLatestRelease(app);
  const environment = deriveEnvironment(app.status);
  const overallHealth = healthSummary ? getHealthAppearance(healthSummary.overall) : undefined;

  const handleSelect = React.useCallback((): void => {
    if (onSelect) {
      onSelect(app.id);
    }
  }, [app.id, onSelect]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSelect();
      }
    },
    [handleSelect]
  );

  return (
    <article
      className={`${styles.card} ${compact ? styles.compactCard : ''} ${onSelect ? styles.clickable : ''}`}
      aria-label={`${app.name} application card`}
    >
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleGroup}>
          <h2 className={styles.appName}>
            {onSelect ? (
              <button
                className={styles.appNameButton}
                onClick={handleSelect}
                onKeyDown={handleKeyDown}
                aria-label={`${app.name} — view details`}
              >
                {app.name}
              </button>
            ) : (
              app.name
            )}
          </h2>
          <p className={styles.owner}>{app.owner}</p>
        </div>
        <div className={styles.badges}>
          <StatusBadge {...statusStyle} ariaLabel={`Status: ${statusStyle.label}`} />
          {overallHealth && <StatusBadge {...overallHealth} ariaLabel={`Overall health: ${overallHealth.label}`} />}
        </div>
      </header>

      <p className={styles.description}>
        {compact && app.description.length > 120 ? `${app.description.substring(0, 120)}…` : app.description}
      </p>

      {compact && (
        <>
          <dl className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <dt>Version</dt>
              <dd>{latestRelease ? latestRelease.version : 'N/A'}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Environment</dt>
              <dd>{environment}</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Last Updated</dt>
              <dd>{latestRelease ? formatDisplayDate(latestRelease.date) : 'N/A'}</dd>
            </div>
          </dl>

          <div className={styles.docSection}>
            <div className={styles.docBarLabel}>
              <span>Documentation</span>
              <span className={styles.docBarPct}>{app.docCompleteness}%</span>
            </div>
            <div
              className={styles.docBarTrack}
              role="progressbar"
              aria-valuenow={app.docCompleteness}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Documentation completeness: ${app.docCompleteness}%`}
            >
              <div
                className={styles.docBarFill}
                style={{
                  width: `${app.docCompleteness}%`,
                  background: getDocBarColor(app.docCompleteness)
                }}
              />
            </div>
          </div>

          {(healthSummary?.accessibility || healthSummary?.security) && (
            <div className={styles.statusRow}>
              {healthSummary?.accessibility && (
                <span className={styles.statusPill}>
                  <HealthIndicator
                    label="Accessibility"
                    status={healthSummary.accessibility}
                    variant="compact"
                    compactPrefix="A11Y"
                  />
                </span>
              )}
              {healthSummary?.security && (
                <span className={styles.statusPill}>
                  <HealthIndicator
                    label="Security"
                    status={healthSummary.security}
                    variant="compact"
                    compactPrefix="Security"
                  />
                </span>
              )}
            </div>
          )}
        </>
      )}

      {app.tags && app.tags.length > 0 && (
        <ul className={styles.tagsRow} aria-label="Tags">
          {app.tags.map(tag => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};
