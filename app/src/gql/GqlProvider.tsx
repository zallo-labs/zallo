import { ReactNode } from 'react';
import { Provider as UrqlProvider } from 'urql';
import { useUrqlApiClient } from '@api/client';

export interface GqlProviderProps {
  children: ReactNode;
}

export function GqlProvider({ children }: GqlProviderProps) {
  return <UrqlProvider value={useUrqlApiClient()}>{children}</UrqlProvider>;
}
