import * as React from 'react';
import { Stack, Text, Icon } from '@fluentui/react';

import { IApplication, SecurityDocStatus } from '../../models';
import { SECURITY_DOC_STATUS_APPEARANCE } from '../../utils/statusPresentation';
import { StatusBadge } from '../StatusBadge/StatusBadge';

interface ISecurityStatusProps {
  app: IApplication;
}

function SecurityRow(props: { label: string; status: SecurityDocStatus }): JSX.Element {
  const { label, status } = props;
  const appearance = SECURITY_DOC_STATUS_APPEARANCE[status];

  return (
    <Stack
      horizontal
      verticalAlign="center"
      tokens={{ childrenGap: 10 }}
      styles={{ root: { padding: '6px 12px', borderBottom: '1px solid #f3f2f1' } }}
    >
      <Icon iconName={appearance.iconName} styles={{ root: { color: appearance.color, fontSize: 16, width: 20 } }} aria-hidden />
      <Text variant="small" styles={{ root: { flex: 1 } }}>
        {label}
      </Text>
      <StatusBadge {...appearance} ariaLabel={`${label}: ${appearance.label}`} />
    </Stack>
  );
}

export const SecurityStatus: React.FC<ISecurityStatusProps> = ({ app }) => {
  const { securityStatus } = app;

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
        Security &amp; Documentation Status
      </Text>
      <Stack styles={{ root: { border: '1px solid #edebe9', borderRadius: 4, overflow: 'hidden' } }}>
        <SecurityRow label="Threat Model" status={securityStatus.threatModelComplete} />
        <SecurityRow label="Data Classification" status={securityStatus.dataClassificationComplete} />
        <SecurityRow label="Security Review" status={securityStatus.securityReviewComplete} />
        <SecurityRow label="Privacy Impact Assessment" status={securityStatus.privacyImpactAssessment} />
      </Stack>
      {securityStatus.notes && (
        <Text variant="small" styles={{ root: { color: '#605e5c', fontStyle: 'italic', padding: '0 4px' } }}>
          <span aria-hidden="true">📝</span> {securityStatus.notes}
        </Text>
      )}
    </Stack>
  );
};
