import * as React from 'react';
import { Text } from '@fluentui/react';
import styles from './BuildMetadata.module.scss';

export interface IBuildMetadataProps {
  webPartVersion: string;
  useMockData: boolean;
  userDisplayName: string | undefined;
  siteTitle: string | undefined;
}

export const BuildMetadata: React.FC<IBuildMetadataProps> = ({
  webPartVersion,
  useMockData,
  userDisplayName,
  siteTitle
}) => {
  const timestamp = React.useMemo(() => {
    return new Date().toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const items: { label: string; value: string }[] = [
    { label: 'Version', value: webPartVersion },
    { label: 'Data source', value: useMockData ? 'Mock Data' : 'SharePoint' }
  ];

  if (userDisplayName) {
    items.push({ label: 'User', value: userDisplayName });
  }
  if (siteTitle) {
    items.push({ label: 'Site', value: siteTitle });
  }

  items.push({ label: 'As of', value: timestamp });

  return (
    <div className={styles.buildMetadata} aria-label="Build metadata">
      {items.map(item => (
        <span key={item.label} className={styles.metaItem}>
          <Text className={styles.metaLabel}>{item.label}:</Text>
          <Text className={styles.metaValue}>{item.value}</Text>
        </span>
      ))}
    </div>
  );
};
