import * as React from 'react';
import { Stack, Text, Link, Icon } from '@fluentui/react';
import { IApplication } from '../../models';

interface IQuickLinksProps {
  app: IApplication;
}

export const QuickLinks: React.FC<IQuickLinksProps> = ({ app }) => {
  if (!app.quickLinks || app.quickLinks.length === 0) {
    return null;
  }

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Quick Links</Text>
      <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
        {app.quickLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.url}
            target='_blank'
            rel='noopener noreferrer'
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                border: '1px solid #0078d4',
                borderRadius: 4,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                color: '#0078d4',
                background: '#f0f6ff',
                transition: 'background 0.1s',
                ':hover': { background: '#ddeeff' }
              }
            }}
          >
            {link.iconName && (
              <Icon iconName={link.iconName} styles={{ root: { fontSize: 15 } }} />
            )}
            {link.label}
          </Link>
        ))}
      </Stack>
    </Stack>
  );
};
