import { useEffect } from 'react';
import { logError } from '~/util/analytics';
import { ErrorBoundaryProps as BaseProps, usePathname } from 'expo-router';

export interface IgnoredErrorBoundaryProps extends BaseProps {}

export function IgnoredErrorBoundary({ error, retry }: IgnoredErrorBoundaryProps) {
  const pathname = usePathname();

  useEffect(() => {
    logError(error.name, { error, pathname, caught: true });
  }, [error, pathname]);

  useEffect(() => {
    const timer = setTimeout(retry, 1000);

    return () => clearTimeout(timer);
  }, [retry]);

  return null;
}
