import { SignClientTypes } from '@walletconnect/types';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Topic, TopicV1, TopicV2 } from './useTopic';
import { useWalletConnectClients } from './WalletConnectProvider';

export type WcProposer = SignClientTypes.Metadata;

export interface WcSessionData {
  topic: Topic;
  proposer: WcProposer;
  expiry?: DateTime;
}

export const useWalletConnectSessions = () => {
  const { client: clientV2, connectionsV1 } = useWalletConnectClients();

  return useMemo(
    (): Map<string, WcSessionData> =>
      new Map([
        ...clientV2.session.values.map((s): [string, WcSessionData] => [
          s.topic,
          {
            topic: s.topic as TopicV2,
            proposer: s.peer.metadata,
            expiry: DateTime.fromSeconds(s.expiry),
          },
        ]),
        ...[...connectionsV1.values()].map((c): [string, WcSessionData] => [
          c.uri,
          {
            topic: c.uri as TopicV1,
            proposer: c.peerMeta!,
          },
        ]),
      ]),
    [clientV2.session.values, connectionsV1],
  );
};
