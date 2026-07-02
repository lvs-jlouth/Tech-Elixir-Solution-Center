import * as React from 'react';
import { Icon } from '@fluentui/react';

import { IStatusAppearance } from '../../utils/statusPresentation';

export interface IStatusBadgeProps extends IStatusAppearance {
  ariaLabel?: string;
}

export const StatusBadge: React.FC<IStatusBadgeProps> = ({
  ariaLabel,
  background,
  color,
  iconName,
  label
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      borderRadius: 10,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      background,
      color
    }}
    aria-label={ariaLabel || label}
  >
    {iconName && <Icon iconName={iconName} styles={{ root: { fontSize: 11 } }} aria-hidden />}
    {label}
  </span>
);
