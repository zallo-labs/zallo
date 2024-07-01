import { ReactNode } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { useApiEnvironment } from './environment';
import { withSuspense } from '#/skeleton/withSuspense';
import { Splash } from '#/Splash';
import { RelayStorePersistor } from './RelayStorePersistor';

export interface ApiProviderProps {
  children: ReactNode;
}

function ApiProvider_({ children }: ApiProviderProps) {
  return (
    <RelayEnvironmentProvider environment={useApiEnvironment()}>
      <RelayStorePersistor />
      {children}
    </RelayEnvironmentProvider>
  );
}

export const ApiProvider = withSuspense(ApiProvider_, <Splash />);
