import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react';

export interface ILoadingStateProps {
  label: string;
  size?: SpinnerSize;
}

export const LoadingState: React.FC<ILoadingStateProps> = ({
  label,
  size = SpinnerSize.large
}) => <Spinner size={size} label={label} />;
