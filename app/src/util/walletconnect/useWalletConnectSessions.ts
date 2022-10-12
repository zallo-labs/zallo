import { SignClientTypes } from '@walletconnect/types';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useWalletConnectClients } from './WalletConnectProvider';

export type WcProposer = SignClientTypes.Metadata;

export interface WcSession {
  version: 1 | 2;
  topicOrUri: string;
  proposer: WcProposer;
  expiry?: DateTime;
}

export const useWalletConnectSessions = () => {
  const { client: clientV2, connectionsV1 } = useWalletConnectClients();

  return useMemo(
    (): Map<string, WcSession> =>
      new Map([
        ...clientV2.session.values.map((s): [string, WcSession] => [
          s.topic,
          {
            version: 2,
            topicOrUri: s.topic,
            proposer: s.peer.metadata,
            expiry: DateTime.fromSeconds(s.expiry),
          },
        ]),
        ...[...connectionsV1.values()].map((c): [string, WcSession] => [
          c.uri,
          {
            version: 1,
            topicOrUri: c.uri,
            proposer: c.peerMeta!,
          },
        ]),
      ]),
    [clientV2.session.values, connectionsV1],
  );
};
