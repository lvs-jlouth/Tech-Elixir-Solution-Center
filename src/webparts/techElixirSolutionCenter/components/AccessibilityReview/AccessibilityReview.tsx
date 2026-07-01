import * as React from 'react';
import { Stack, Text, Icon } from '@fluentui/react';
import { IApplication, IAccessibilityItem } from '../../models';

interface IAccessibilityReviewProps {
  app: IApplication;
}

const STATUS_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  Pass: { icon: 'CheckMark', color: '#107c10', label: 'Pass' },
  Fail: { icon: 'Clear', color: '#a80000', label: 'Fail' },
  NeedsReview: { icon: 'Warning', color: '#8a5700', label: 'Needs Review' },
  NotApplicable: { icon: 'Remove', color: '#a19f9d', label: 'N/A' }
};

export const AccessibilityReview: React.FC<IAccessibilityReviewProps> = ({ app }) => {
  if (!app.accessibilityItems || app.accessibilityItems.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Accessibility Review</Text>
        <Text variant='small' styles={{ root: { color: '#a19f9d' } }}>No accessibility items tracked.</Text>
      </Stack>
    );
  }

  const passCount = app.accessibilityItems.filter(i => i.status === 'Pass').length;
  const failCount = app.accessibilityItems.filter(i => i.status === 'Fail').length;
  const reviewCount = app.accessibilityItems.filter(i => i.status === 'NeedsReview').length;
  const total = app.accessibilityItems.filter(i => i.status !== 'NotApplicable').length;

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 10 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Accessibility Review</Text>
        <span style={{ fontSize: 12, color: '#605e5c' }}>
          {passCount}/{total} passed
        </span>
        {failCount > 0 && (
          <span style={{ background: '#fde7e9', color: '#a80000', borderRadius: 10, padding: '0 8px', fontSize: 12, fontWeight: 600 }}>
            {failCount} failing
          </span>
        )}
        {reviewCount > 0 && (
          <span style={{ background: '#fff4ce', color: '#8a5700', borderRadius: 10, padding: '0 8px', fontSize: 12, fontWeight: 600 }}>
            {reviewCount} needs review
          </span>
        )}
      </Stack>

      <Stack tokens={{ childrenGap: 6 }}>
        {app.accessibilityItems.map(item => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['NeedsReview'];
          return (
            <Stack
              key={item.id}
              horizontal
              verticalAlign='start'
              tokens={{ childrenGap: 10 }}
              styles={{ root: { padding: '8px 12px', border: '1px solid #edebe9', borderRadius: 4 } }}
            >
              <Icon
                iconName={cfg.icon}
                styles={{ root: { color: cfg.color, fontSize: 16, marginTop: 2, flexShrink: 0 } }}
                aria-label={cfg.label}
              />
              <Stack tokens={{ childrenGap: 2 }} grow>
                <Stack horizontal horizontalAlign='space-between'>
                  <Text variant='small' styles={{ root: { fontWeight: 600 } }}>{item.requirement}</Text>
                  <Text variant='tiny' styles={{ root: { color: '#605e5c', whiteSpace: 'nowrap', marginLeft: 8 } }}>
                    {item.wcagCriteria}
                  </Text>
                </Stack>
                {item.notes && (
                  <Text variant='tiny' styles={{ root: { color: '#605e5c', fontStyle: 'italic' } }}>
                    {item.notes}
                  </Text>
                )}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
