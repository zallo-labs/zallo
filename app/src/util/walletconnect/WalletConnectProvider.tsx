import '@walletconnect/react-native-compat'; // CRITICAL to import first
import SignClient from '@walletconnect/sign-client';
import assert from 'assert';
import { createContext, ReactNode, useContext } from 'react';
import { useWalletConnectV2 } from './useWalletConnectV2';
import Connector from '@walletconnect/client';
import { Updater, useImmer } from 'use-immer';
import { MaybePromise } from 'lib';

type ConnectionsV1 = Map<string, Connector>;

export interface WalletConnectContext {
  client: SignClient;
  // Required due to many function mutating the class internally - which doesn't cause a re-render
  withClient: (
    f: (client: SignClient) => MaybePromise<unknown>,
  ) => Promise<void>;
  connectionsV1: ConnectionsV1;
  updateConnectionsV1: Updater<ConnectionsV1>;
  withConnectionV1: (
    uri: string,
    f: (connection: Connector) => MaybePromise<unknown>,
  ) => Promise<void>;
}

const CONTEXT = createContext<WalletConnectContext | undefined>(undefined);

export const useWalletConnectClients = () => {
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
  const [clientV2, setClientV2] = useWalletConnectV2();
  const [connectionsV1, updateConnectionsV1] = useImmer<ConnectionsV1>(
    () => new Map(),
  );

  return (
    <CONTEXT.Provider
      value={{
        client: clientV2,
        withClient: async (f) => {
          await f(clientV2);
          setClientV2(clientV2);
        },
        connectionsV1,
        updateConnectionsV1,
        withConnectionV1: async (uri, f) => {
          const connection = connectionsV1.get(uri);
          assert(connection);
          await f(connection);
          updateConnectionsV1((connections) =>
            connections.set(uri, connection),
          );
        },
      }}
    >
      {children}
    </CONTEXT.Provider>
  );
};
