import * as React from 'react';
import { ProgressIndicator, Stack, Text } from '@fluentui/react';
import { IApplication } from '../../models';
import { getDocBarColor } from '../../utils/solutionDisplay';

interface IDocCompletenessBarProps {
  app: IApplication;
}

export const DocCompletenessBar: React.FC<IDocCompletenessBarProps> = ({ app }) => {
  const pct = Math.min(100, Math.max(0, app.docCompleteness)) / 100;
  const color = getDocBarColor(app.docCompleteness);

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
