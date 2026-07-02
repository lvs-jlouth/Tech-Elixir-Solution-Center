import * as React from 'react';
import { Stack, Text, Link, Icon } from '@fluentui/react';
import { IApplication } from '../../models';

interface IGitHubLinksProps {
  app: IApplication;
}

export const GitHubLinks: React.FC<IGitHubLinksProps> = ({ app }) => {
  if (!app.githubRepoUrl) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>GitHub Repository</Text>
        <Text variant='small' styles={{ root: { color: '#a19f9d' } }}>No GitHub repository linked.</Text>
      </Stack>
    );
  }

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>GitHub Repository</Text>
      <Stack
        horizontal
        verticalAlign='center'
        tokens={{ childrenGap: 10 }}
        styles={{ root: { padding: '10px 14px', border: '1px solid #edebe9', borderRadius: 4 } }}
      >
        <Icon iconName='CodeEdit' styles={{ root: { fontSize: 20, color: '#0078d4' } }} aria-hidden />
        <Link href={app.githubRepoUrl} target='_blank' rel='noopener noreferrer'>
          {app.githubRepoUrl}
        </Link>
        <Icon
          iconName='OpenInNewWindow'
          styles={{ root: { fontSize: 12, color: '#0078d4', marginLeft: 4 } }}
          aria-hidden
        />
      </Stack>
      <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
        {[
          { label: 'Issues', path: '/issues', icon: 'WorkItem' },
          { label: 'Pull Requests', path: '/pulls', icon: 'BranchMerge' },
          { label: 'Projects', path: '/projects', icon: 'ProjectLogo32' },
          { label: 'Actions', path: '/actions', icon: 'PlayResume' }
        ].map(item => (
          <Link
            key={item.label}
            href={`${app.githubRepoUrl}${item.path}`}
            target='_blank'
            rel='noopener noreferrer'
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                border: '1px solid #0078d4',
                borderRadius: 4,
                fontSize: 13,
                textDecoration: 'none'
              }
            }}
          >
            <Icon iconName={item.icon} styles={{ root: { fontSize: 14 } }} aria-hidden />
            {item.label}
          </Link>
        ))}
      </Stack>
    </Stack>
  );
};
