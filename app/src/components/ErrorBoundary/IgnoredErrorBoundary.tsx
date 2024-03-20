import { useEffect } from 'react';
import { logError } from '~/util/analytics';
import { ErrorBoundaryProps as BaseProps } from 'expo-router';
import { atom, useAtom } from 'jotai';

const attemptsAtom = atom(0);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

export interface IgnoredErrorBoundaryProps extends BaseProps {}

export function IgnoredErrorBoundary({ error, retry }: IgnoredErrorBoundaryProps) {
  const [attempts, setAttempts] = useAtom(attemptsAtom);

  useEffect(() => {
    if (attempts < MAX_ATTEMPTS) {
      setAttempts((a) => a + 1);
      logError(error.name, { error, ignored: true, attempts });

      const timer = setTimeout(retry, RETRY_DELAY);

      return () => clearTimeout(timer);
    }
  }, [attempts, error, retry, setAttempts]);

  return null;
}
