import { useCallback } from 'react';
import {
  popToProposal,
  usePropose,
} from '~/mutations/proposal/propose/usePropose';
import { toWcResult } from './jsonRcp';
import { WcSendTransactionData } from './methods/transaction';
import { WcClient } from './util';

export const useHandleWcSend = () => {
  const [propose] = usePropose();

  return useCallback(
    async (
      client: WcClient,
      id: number,
      topic: string | undefined,
      tx: WcSendTransactionData,
    ) => {
      await propose(
        tx.from,
        {
          to: tx.to,
          value: tx.value,
          data: tx.data,
          gasLimit: tx.gasLimit,
        },
        (proposal, navigation) => {
          popToProposal(proposal, navigation, (resp) => {
            if (client.version === 2) {
              client.respond({
                topic: topic!,
                response: toWcResult(id, resp.hash),
              });
            } else {
              client.approveRequest({
                id,
                result: resp.hash,
              });
            }
          });
        },
      );
    },
    [propose],
  );
};
