import '@walletconnect/react-native-compat'; // CRITICAL to import first
import SignClient from '@walletconnect/sign-client';
import assert from 'assert';
import { createContext, ReactNode, useContext, useState } from 'react';
import useAsyncEffect from 'use-async-effect';
import { Suspend } from '~/components/Suspender';
import {
  useHandleSignClientEvents,
  WALLET_CONNECT_SIGN_CLIENT,
} from './signClient';

export interface WalletConnectContext {
  client: SignClient;
  // Required due to many function mutating the class internally - which doesn't cause a re-render
  withClient: (
    f: (client: SignClient) => unknown | Promise<unknown>,
  ) => Promise<void>;
}

const CONTEXT = createContext<WalletConnectContext | undefined>(undefined);

export const useWalletConnect = () => {
  const context = useContext(CONTEXT);
  assert(context);
  return context;
};

export interface WalletConnectProviderProps {
  children?: ReactNode;
}

export const WalletConnectProvider = ({
  children,
}: WalletConnectProviderProps) => {
  const [client, setClient] = useState<SignClient | undefined>(undefined);
  const [, setCounter] = useState(0);
  useHandleSignClientEvents(client);

  useAsyncEffect(async (isMounted) => {
    const signClient = await WALLET_CONNECT_SIGN_CLIENT;
    if (isMounted()) setClient(signClient);
  }, []);

  if (!client) return <Suspend />;

  return (
    <CONTEXT.Provider
      value={{
        client,
        withClient: async (f) => {
          await f(client);
          setCounter((c) => c + 1);
        },
      }}
    >
      {children}
    </CONTEXT.Provider>
  );
};
