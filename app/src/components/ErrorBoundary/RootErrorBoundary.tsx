import { useEffect } from 'react';
import { logError } from '~/util/analytics';
import { ErrorBoundaryProps as BaseProps } from 'expo-router';
import { Button } from '#/Button';
import { ErrorBoundaryDetails } from './ErrorBoundaryDetails';

export interface RootErrorBoundaryProps extends BaseProps {}

export function RootErrorBoundary({ error, retry }: RootErrorBoundaryProps) {
  useEffect(() => {
    logError(error.name, { error, root: true });
  }, [error]);

  return (
    <ErrorBoundaryDetails
      actions={
        <Button mode="contained" onPress={retry}>
          Retry
        </Button>
      }
    />
  );
}
