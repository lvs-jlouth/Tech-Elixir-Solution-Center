import * as React from 'react';
import { Stack, Text, Icon, TooltipHost } from '@fluentui/react';
import { IApplication, SecurityDocStatus } from '../../models';

interface ISecurityStatusProps {
  app: IApplication;
}

const STATUS_DISPLAY: Record<SecurityDocStatus, { icon: string; color: string; label: string }> = {
  Complete: { icon: 'CheckMark', color: '#107c10', label: 'Complete' },
  InProgress: { icon: 'SyncOccurence', color: '#8a5700', label: 'In Progress' },
  NeedsReview: { icon: 'Warning', color: '#c43501', label: 'Needs Review' },
  NotStarted: { icon: 'RemoveFilter', color: '#a80000', label: 'Not Started' }
};

function SecurityRow({ label, status, tooltip }: { label: string; status: SecurityDocStatus; tooltip?: string }): JSX.Element {
  const cfg = STATUS_DISPLAY[status] || STATUS_DISPLAY['NotStarted'];
  return (
    <Stack
      horizontal
      verticalAlign='center'
      tokens={{ childrenGap: 10 }}
      styles={{ root: { padding: '6px 12px', borderBottom: '1px solid #f3f2f1' } }}
    >
      <Icon iconName={cfg.icon} styles={{ root: { color: cfg.color, fontSize: 16, width: 20 } }} aria-hidden />
      <Text variant='small' styles={{ root: { flex: 1 } }}>{label}</Text>
      <span style={{ background: cfg.color === '#107c10' ? '#dff6dd' : cfg.color === '#a80000' ? '#fde7e9' : '#fff4ce',
                     color: cfg.color, borderRadius: 3, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
        {cfg.label}
      </span>
    </Stack>
  );
}

export const SecurityStatus: React.FC<ISecurityStatusProps> = ({ app }) => {
  const { securityStatus } = app;

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Security &amp; Documentation Status</Text>
      <Stack styles={{ root: { border: '1px solid #edebe9', borderRadius: 4, overflow: 'hidden' } }}>
        <SecurityRow label='Threat Model' status={securityStatus.threatModelComplete} />
        <SecurityRow label='Data Classification' status={securityStatus.dataClassificationComplete} />
        <SecurityRow label='Security Review' status={securityStatus.securityReviewComplete} />
        <SecurityRow label='Privacy Impact Assessment' status={securityStatus.privacyImpactAssessment} />
      </Stack>
      {securityStatus.notes && (
        <Text variant='small' styles={{ root: { color: '#605e5c', fontStyle: 'italic', padding: '0 4px' } }}>
          <span aria-hidden='true'>📝</span>{' '}{securityStatus.notes}
        </Text>
      )}
    </Stack>
  );
};
