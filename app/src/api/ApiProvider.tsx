import { ReactNode } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { useApiEnvironment } from './environment';

export interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  return <RelayEnvironmentProvider environment={useApiEnvironment()}>{children}</RelayEnvironmentProvider>;
}

