import { ReactNode, useEffect, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { useApiEnvironment } from './environment';
import { withSuspense } from '#/skeleton/withSuspense';
import { Splash } from '#/Splash';

export interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const environment = useApiEnvironment();

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    console.log('ENVIRONMENT', environment);
    setLoaded(true);
  }, [environment]);

  if (!loaded) return <Splash />;

  return <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>;
}

// export const ApiProvider = withSuspense(ApiProvider_, <Splash />);
