import * as React from 'react';
import { IApplication, AppStatus } from '../../models';
import { IHealthSummary } from '../../models/IMockDataTypes';
import { HealthStatus } from '../../constants';
import styles from './AppOverviewCard.module.scss';

interface IAppOverviewCardProps {
  app: IApplication;
  compact?: boolean;
  healthSummary?: IHealthSummary;
  onSelect?: (appId: string) => void;
}

const STATUS_CONFIG: Record<AppStatus, { background: string; color: string; label: string }> = {
  Active: { background: '#dff6dd', color: '#107c10', label: 'Active' },
  InDevelopment: { background: '#fff4ce', color: '#8a5700', label: 'In Development' },
  Deprecated: { background: '#fde7e9', color: '#a80000', label: 'Deprecated' },
  Planned: { background: '#f3f2f1', color: '#605e5c', label: 'Planned' }
};

const HEALTH_CONFIG: Record<string, { label: string; color: string; background: string }> = {
  [HealthStatus.Green]: { label: 'Healthy', color: '#107c10', background: '#dff6dd' },
  [HealthStatus.Yellow]: { label: 'Warning', color: '#8a5700', background: '#fff4ce' },
  [HealthStatus.Red]: { label: 'Critical', color: '#a80000', background: '#fde7e9' },
  [HealthStatus.Unknown]: { label: 'Unknown', color: '#605e5c', background: '#f3f2f1' }
};

function deriveEnvironment(status: AppStatus): string {
  switch (status) {
    case 'Active':        return 'Production';
    case 'InDevelopment': return 'Development';
    case 'Deprecated':   return 'Production';
    case 'Planned':      return 'Development';
    default:             return 'Unknown';
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getDocBarColor(pct: number): string {
  if (pct >= 75) return '#107c10';
  if (pct >= 50) return '#8a5700';
  return '#a80000';
}

export const AppOverviewCard: React.FC<IAppOverviewCardProps> = ({ app, compact, healthSummary, onSelect }) => {
  const statusStyle = STATUS_CONFIG[app.status] || STATUS_CONFIG['Planned'];
  const latestRelease = app.releaseNotes && app.releaseNotes.length > 0 ? app.releaseNotes[0] : null;
  const environment = deriveEnvironment(app.status);
  const overallHealth = healthSummary ? HEALTH_CONFIG[healthSummary.overall] : null;
  const a11yHealth = healthSummary ? HEALTH_CONFIG[healthSummary.accessibility] : null;
  const secHealth = healthSummary ? HEALTH_CONFIG[healthSummary.security] : null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
    if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect(app.id);
    }
  };

  return (
    <article
      className={`${styles.card} ${compact ? styles.compactCard : ''} ${onSelect ? styles.clickable : ''}`}
      tabIndex={0}
      role={onSelect ? 'button' : undefined}
      aria-label={onSelect ? `${app.name} — press Enter to view details` : `${app.name} application card`}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      onClick={onSelect ? () => onSelect(app.id) : undefined}
    >
      {/* ── Header: title + status/health badges ── */}
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleGroup}>
          <h2 className={styles.appName}>{app.name}</h2>
          <p className={styles.owner}>{app.owner}</p>
        </div>
        <div className={styles.badges}>
          <span
            className={styles.badge}
            style={{ background: statusStyle.background, color: statusStyle.color }}
            aria-label={`Status: ${statusStyle.label}`}
          >
            {statusStyle.label}
          </span>
          {overallHealth && (
            <span
              className={styles.badge}
              style={{ background: overallHealth.background, color: overallHealth.color }}
              aria-label={`Overall health: ${overallHealth.label}`}
            >
              {overallHealth.label}
            </span>
          )}
        </div>
      </header>

      {/* ── Description ── */}
      <p className={styles.description}>
        {compact && app.description.length > 120
          ? `${app.description.substring(0, 120)}…`
          : app.description}
      </p>

      {/* ── Compact-only detail section ── */}
      {compact && (
        <>
          {/* Version / Environment / Last Updated */}
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
              <dd>{latestRelease ? formatDate(latestRelease.date) : 'N/A'}</dd>
            </div>
          </dl>

          {/* Documentation completeness bar */}
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

          {/* Accessibility and Security status */}
          {(a11yHealth || secHealth) && (
            <div className={styles.statusRow}>
              {a11yHealth && (
                <span
                  className={styles.statusPill}
                  style={{ background: a11yHealth.background, color: a11yHealth.color }}
                  aria-label={`Accessibility: ${a11yHealth.label}`}
                >
                  A11Y: {a11yHealth.label}
                </span>
              )}
              {secHealth && (
                <span
                  className={styles.statusPill}
                  style={{ background: secHealth.background, color: secHealth.color }}
                  aria-label={`Security: ${secHealth.label}`}
                >
                  Security: {secHealth.label}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Tags ── */}
      {app.tags && app.tags.length > 0 && (
        <ul className={styles.tagsRow} aria-label="Tags">
          {app.tags.map(tag => (
            <li key={tag} className={styles.tag}>{tag}</li>
          ))}
        </ul>
      )}
    </article>
  );
};
