import * as React from 'react';

import { IApplication } from '../../models';
import { ReleaseTimeline } from '../ReleaseTimeline/ReleaseTimeline';

interface IReleaseNotesProps {
  app: IApplication;
}

export const ReleaseNotes: React.FC<IReleaseNotesProps> = ({ app }) => <ReleaseTimeline app={app} />;
