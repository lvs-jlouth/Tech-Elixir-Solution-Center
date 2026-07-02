import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';

export interface IErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<IErrorStateProps> = ({ message }) => (
  <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
    {message}
  </MessageBar>
);
