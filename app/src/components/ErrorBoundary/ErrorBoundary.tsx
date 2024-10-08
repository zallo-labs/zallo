import { useEffect } from 'react';
import { logError } from '~/util/analytics';
import { ErrorBoundaryProps as BaseProps, Link } from 'expo-router';
import { Button } from '#/Button';
import { usePathname } from 'expo-router';
import { ErrorBoundaryDetails } from './ErrorBoundaryDetails';

export interface ErrorBoundaryProps extends BaseProps {}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const pathname = usePathname();

  useEffect(() => {
    logError(error.name, { error, pathname });
  }, [error, pathname]);

  return (
    <ErrorBoundaryDetails
      error={error}
      actions={
        <>
          <Button mode="text" onPress={retry}>
            Retry
          </Button>

          <Link href=".." asChild>
            <Button mode="contained">Back</Button>
          </Link>
        </>
      }
    />
  );
}
