import * as React from 'react';

import { getHealthAppearance } from '../../utils/statusPresentation';
import { StatusBadge } from '../StatusBadge/StatusBadge';

export interface IHealthIndicatorProps {
  label: string;
  status: string | undefined;
  variant?: 'compact' | 'stacked';
  compactPrefix?: string;
}

export const HealthIndicator: React.FC<IHealthIndicatorProps> = ({
  compactPrefix,
  label,
  status,
  variant = 'stacked'
}) => {
  const appearance = getHealthAppearance(status);
  const badgeLabel = compactPrefix ? `${compactPrefix}: ${appearance.label}` : appearance.label;
  const ariaLabel = `${label}: ${appearance.label}`;

  if (variant === 'compact') {
    return <StatusBadge {...appearance} label={badgeLabel} ariaLabel={ariaLabel} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, color: '#605e5c' }}>{label}</span>
      <StatusBadge {...appearance} ariaLabel={ariaLabel} />
    </div>
  );
};
