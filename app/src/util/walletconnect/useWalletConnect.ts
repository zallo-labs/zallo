import { CHAIN_ID } from '@network/provider';
import { Address, tryOr } from 'lib';
import { useMemo } from 'react';
import { useWalletConnectClients } from './WalletConnectProvider';
import { getSdkError } from '@walletconnect/utils';
import { toWcError, toWcResult } from './jsonRcp';
import { usePairWalletConnectV1 } from './usePairWalletConnectV1';
import { toNamespaces } from './namespaces';
import assert from 'assert';

type ErrorReason = Parameters<typeof getSdkError>[0];

const URI_PATTERN = new RegExp(`^wc:[0-9a-fA-F]{64}@1`);
const isUriV1 = (uri?: string): uri is 'wc:' =>
  uri !== undefined && URI_PATTERN.test(uri);

export const useWalletConnect = () => {
  const pairV1 = usePairWalletConnectV1();
  const {
    client: clientV2,
    withClient: withClientV2,
    connectionsV1,
    withConnectionV1,
    updateConnectionsV1,
  } = useWalletConnectClients();

  return useMemo(
    () => ({
      session: {
        pair: (uri: string) => {
          if (isUriV1(uri)) {
            pairV1(uri);
          } else {
            withClientV2((client) => client.pair({ uri }));
          }
        },
        approve: (uri: string | undefined, id: number, accounts: Address[]) => {
          if (isUriV1(uri)) {
            withConnectionV1(uri, (connection) => {
              connection.approveSession({
                accounts,
                chainId: CHAIN_ID(),
              });
            });
          } else {
            withClientV2((client) => {
              client.approve({
                id,
                namespaces: toNamespaces(accounts),
              });
            });
          }
        },
        reject: (uri: string | undefined, id: number, reason: ErrorReason) => {
          if (isUriV1(uri)) {
            withConnectionV1(uri, (connection) => {
              connection.rejectSession({
                message: getSdkError(reason).message,
              });
            });
          } else {
            withClientV2((client) => {
              client.reject({ id, reason: getSdkError(reason) });
            });
          }
        },
        disconnect: (topicOrUri: string, reason: ErrorReason) => {
          if (isUriV1(topicOrUri)) {
            withConnectionV1(topicOrUri, (connection) => {
              connection.killSession({ message: getSdkError(reason).message });
            });
          } else {
            withClientV2((client) => {
              client.disconnect({
                topic: topicOrUri,
                reason: getSdkError(reason),
              });
            });
          }
        },
        checkConnectedOrDisconnect: (topicOrUri: string) => {
          if (isUriV1(topicOrUri)) {
            const connection = connectionsV1.get(topicOrUri);
            assert(connection);
            if (!connection.connected) {
              updateConnectionsV1((connections) => {
                connections.delete(topicOrUri);
              });
            }
          } else {
            tryOr(
              () => clientV2.ping({ topic: topicOrUri }),
              () =>
                withClientV2((client) =>
                  client.disconnect({
                    topic: topicOrUri,
                    reason: getSdkError('USER_DISCONNECTED'),
                  }),
                ),
            );
          }
        },
      },
      request: {
        approve: <T>(topicOrUri: string, id: number, response: T) => {
          if (isUriV1(topicOrUri)) {
            withConnectionV1(topicOrUri, (connection) => {
              connection.approveRequest({ id, result: response });
            });
          } else {
            withClientV2((client) => {
              client.respond({
                topic: topicOrUri,
                response: toWcResult(id, response),
              });
            });
          }
        },
        reject: (topicOrUri: string, id: number, reason: ErrorReason) => {
          if (isUriV1(topicOrUri)) {
            withConnectionV1(topicOrUri, (connection) => {
              connection.rejectRequest({ id, error: getSdkError(reason) });
            });
          } else {
            withClientV2((client) => {
              client.respond({
                topic: topicOrUri,
                response: toWcError(id, reason),
              });
            });
          }
        },
      },
    }),
    [pairV1, withClientV2, withConnectionV1],
  );
};
