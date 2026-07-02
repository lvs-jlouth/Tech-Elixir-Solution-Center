import * as React from 'react';
import { DefaultButton, MessageBar, MessageBarType, Stack, Text } from '@fluentui/react';

export interface IErrorStateProps {
  /** User-friendly message shown in the message bar. */
  message: string;
  /** Optional technical detail shown beneath the message bar (collapsed by default). */
  technicalDetails?: string;
  /** When provided, a Retry button is rendered and calls this handler on click. */
  onRetry?: () => void;
}

export const ErrorState: React.FC<IErrorStateProps> = ({ message, technicalDetails, onRetry }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <MessageBar
        messageBarType={MessageBarType.error}
        isMultiline={!!technicalDetails}
        actions={
          onRetry ? (
            <DefaultButton
              text="Retry"
              onClick={onRetry}
              ariaLabel="Retry loading"
              styles={{ root: { minWidth: 60 } }}
            />
          ) : undefined
        }
      >
        {message}
        {technicalDetails && (
          <span>
            {' '}
            <button
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline', fontSize: 'inherit' }}
              onClick={() => setShowDetails(prev => !prev)}
              aria-expanded={showDetails}
              aria-controls="error-technical-details"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          </span>
        )}
      </MessageBar>
      {technicalDetails && showDetails && (
        <Text
          id="error-technical-details"
          variant="small"
          styles={{ root: { color: '#605e5c', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '4px 8px', background: '#f3f2f1', borderRadius: 2 } }}
        >
          {technicalDetails}
        </Text>
      )}
    </Stack>
  );
};
