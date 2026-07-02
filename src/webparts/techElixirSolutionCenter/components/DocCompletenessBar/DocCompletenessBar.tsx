import * as React from 'react';
import { ProgressIndicator, Stack, Text } from '@fluentui/react';
import { IApplication } from '../../models';

interface IDocCompletenessBarProps {
  app: IApplication;
}

function getColor(pct: number): string {
  if (pct >= 80) return '#107c10';
  if (pct >= 50) return '#8a5700';
  return '#a80000';
}

export const DocCompletenessBar: React.FC<IDocCompletenessBarProps> = ({ app }) => {
  const pct = Math.min(100, Math.max(0, app.docCompleteness)) / 100;
  const color = getColor(app.docCompleteness);

  return (
    <Stack tokens={{ childrenGap: 4 }}>
      <Text variant='mediumPlus' styles={{ root: { fontWeight: 600 } }}>
        Documentation Completeness
      </Text>
      <ProgressIndicator
        label={`${app.docCompleteness}% complete`}
        percentComplete={pct}
        styles={{
          progressBar: { background: color },
          itemName: { color }
        }}
        barHeight={10}
        ariaLabel={`Documentation completeness: ${app.docCompleteness} percent`}
      />
    </Stack>
  );
};
