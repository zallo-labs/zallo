import { useMemo } from 'react';
import { useWalletConnectClients } from './WalletConnectProvider';
import { getSdkError } from '@walletconnect/utils';
import { toWcError, toWcResult } from './jsonRcp';
import { tryOrAsync } from 'lib';
import { useWalletConnectSessions } from './useWalletConnectSessions';

export type Topic = TopicV1 | TopicV2;
export type TopicV1 = string & { version: 1 };
export type TopicV2 = string & { version: 2 };

export const isTopicV1 = (t: Topic): t is TopicV1 => t.startsWith('wc:');

type ErrorReason = Parameters<typeof getSdkError>[0];

export const useSession = (topic: Topic) => {
  const {
    client: clientV2,
    withClient: withClientV2,
    connectionsV1,
    withConnectionV1,
    updateConnectionsV1,
  } = useWalletConnectClients();
  const sessions = useWalletConnectSessions();

  return useMemo(
    () => ({
      disconnect: (reason: ErrorReason) => {
        if (isTopicV1(topic)) {
          withConnectionV1(topic, (connection) => {
            connection.killSession({ message: getSdkError(reason).message });
          });
        } else {
          withClientV2((client) => {
            client.disconnect({
              topic,
              reason: getSdkError(reason),
            });
          });
        }
      },
      checkConnectedOrDisconnect: () => {
        if (isTopicV1(topic)) {
          const connection = connectionsV1.get(topic);
          if (connection && !connection.connected) {
            updateConnectionsV1((connections) => {
              connections.delete(topic);
            });
          }
        } else {
          tryOrAsync(
            () => clientV2.ping({ topic }),
            () =>
              withClientV2((client) =>
                client.disconnect({
                  topic,
                  reason: getSdkError('USER_DISCONNECTED'),
                }),
              ),
          );
        }
      },
      respond: <T>(id: number, response: T) => {
        if (isTopicV1(topic)) {
          withConnectionV1(topic, (connection) => {
            connection.approveRequest({ id, result: response });
          });
        } else {
          withClientV2((client) => {
            client.respond({
              topic,
              response: toWcResult(id, response),
            });
          });
        }
      },
      reject: (id: number, reason: ErrorReason) => {
        if (isTopicV1(topic)) {
          withConnectionV1(topic, (connection) => {
            connection.rejectRequest({ id, error: getSdkError(reason) });
          });
        } else {
          withClientV2((client) => {
            client.respond({
              topic,
              response: toWcError(id, reason),
            });
          });
        }
      },
      proposer: sessions.get(topic)!.proposer,
    }),
    [clientV2, connectionsV1, sessions, topic, updateConnectionsV1, withClientV2, withConnectionV1],
  );
};
