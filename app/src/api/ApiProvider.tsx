import { ReactNode, useEffect, useState } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { getEnvironment, setEnvironment, useApiEnvironment } from './environment';
import { withSuspense } from '#/skeleton/withSuspense';
import { Splash } from '#/Splash';
import { useApproverWallet } from '@network/useApprover';
import { Environment } from 'relay-runtime';

let promisedEnvironment: Promise<Environment> | undefined;

export interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  // const approver = useApproverWallet();
  // console.log(approver);

  // const [env, setEnv] = useState<Environment | null>(null);
  // useEffect(() => {
  //   getEnvironment({
  //     key: 'main',
  //     approver: new Promise<typeof approver>((resolve) => resolve(approver)),
  //     persist: true,
  //   }).then((env) => {
  //     setEnv(env);
  //     setEnvironment(env);
  //   });
  // }, [approver]);

  // if (!env) return <Splash />;

  return <RelayEnvironmentProvider environment={useApiEnvironment()}>{children}</RelayEnvironmentProvider>;
}

// export const ApiProvider = withSuspense(ApiProvider_, <Splash />);
