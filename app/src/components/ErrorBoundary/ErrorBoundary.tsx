import { useEffect } from 'react';
import { logError } from '~/util/analytics';
import { ErrorBoundaryProps as BaseProps, Link } from 'expo-router';
import { Button } from '#/Button';
import { usePathname } from 'expo-router';
import { ErrorBoundaryDetails } from './ErrorBoundaryDetails';

export interface ErrorBoundaryProps extends BaseProps {}

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  const pathname = usePathname();

  useEffect(() => {
    logError(error.name, { error, pathname });
  }, [error, pathname]);

  return (
    <ErrorBoundaryDetails
      actions={
        <Link href=".." asChild>
          <Button mode="contained">Back</Button>
        </Link>
      }
    />
  );
}
