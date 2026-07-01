import * as React from 'react';
import { Stack, Text, Icon } from '@fluentui/react';
import { IApplication } from '../../models';

interface IReleaseNotesProps {
  app: IApplication;
}

export const ReleaseNotes: React.FC<IReleaseNotesProps> = ({ app }) => {
  const [expandedVersion, setExpandedVersion] = React.useState<string | undefined>(
    app.releaseNotes && app.releaseNotes.length > 0 ? app.releaseNotes[0].version : undefined
  );

  if (!app.releaseNotes || app.releaseNotes.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Release Notes</Text>
        <Text variant='small' styles={{ root: { color: '#a19f9d' } }}>No release notes available.</Text>
      </Stack>
    );
  }

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>Release Notes</Text>
      {app.releaseNotes.map((note, idx) => {
        const isExpanded = expandedVersion === note.version;
        return (
          <Stack
            key={idx}
            styles={{ root: { border: '1px solid #edebe9', borderRadius: 4, overflow: 'hidden' } }}
          >
            <Stack
              horizontal
              horizontalAlign='space-between'
              verticalAlign='center'
              styles={{
                root: {
                  padding: '10px 14px',
                  background: isExpanded ? '#eff6fc' : '#faf9f8',
                  cursor: 'pointer',
                  userSelect: 'none'
                }
              }}
              onClick={() => setExpandedVersion(isExpanded ? undefined : note.version)}
              role='button'
              aria-expanded={isExpanded}
            >
              <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign='center'>
                <Icon iconName='ReleaseGate' styles={{ root: { color: '#0078d4', fontSize: 16 } }} />
                <Text styles={{ root: { fontWeight: 600 } }}>v{note.version}</Text>
                <Text variant='small' styles={{ root: { color: '#605e5c' } }}>{note.date}</Text>
              </Stack>
              <Icon iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'} styles={{ root: { color: '#605e5c' } }} />
            </Stack>

            {isExpanded && (
              <Stack tokens={{ childrenGap: 6 }} styles={{ root: { padding: '12px 14px' } }}>
                <Text styles={{ root: { fontStyle: 'italic', color: '#605e5c', marginBottom: 6 } }}>
                  {note.summary}
                </Text>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {note.changes.map((change, cIdx) => (
                    <li key={cIdx} style={{ fontSize: 13, marginBottom: 4 }}>{change}</li>
                  ))}
                </ul>
              </Stack>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};
