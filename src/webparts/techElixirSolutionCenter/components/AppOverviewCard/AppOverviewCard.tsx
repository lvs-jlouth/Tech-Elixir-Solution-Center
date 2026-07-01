import * as React from 'react';
import { Stack, Text, Badge } from '@fluentui/react';
import { IApplication, AppStatus } from '../../models';
import styles from './AppOverviewCard.module.scss';

interface IAppOverviewCardProps {
  app: IApplication;
  compact?: boolean;
}

const STATUS_COLORS: Record<AppStatus, { background: string; color: string; label: string }> = {
  Active: { background: '#dff6dd', color: '#107c10', label: 'Active' },
  InDevelopment: { background: '#fff4ce', color: '#8a5700', label: 'In Development' },
  Deprecated: { background: '#fde7e9', color: '#a80000', label: 'Deprecated' },
  Planned: { background: '#f3f2f1', color: '#605e5c', label: 'Planned' }
};

export const AppOverviewCard: React.FC<IAppOverviewCardProps> = ({ app, compact }) => {
  const statusStyle = STATUS_COLORS[app.status] || STATUS_COLORS['Planned'];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.appName}>{app.name}</p>
          <p className={styles.owner}>Owner: {app.owner}</p>
        </div>
        <span
          style={{
            background: statusStyle.background,
            color: statusStyle.color,
            borderRadius: 4,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          {statusStyle.label}
        </span>
      </div>

      <p className={styles.description}>
        {compact && app.description.length > 120
          ? `${app.description.substring(0, 120)}…`
          : app.description}
      </p>

      {app.tags && app.tags.length > 0 && (
        <div className={styles.tagsRow}>
          {app.tags.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};
