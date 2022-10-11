import { SignClient } from '@walletconnect/sign-client/dist/types/client';
import { BigNumberish, BytesLike } from 'ethers';
import { Address } from 'lib';
import { useCallback } from 'react';
import {
  popToProposal,
  usePropose,
} from '~/mutations/proposal/propose/usePropose';
import { toWcResult } from './jsonRcp';
import { WcEventParams } from './methods';

interface SendTx {
  from: Address;
  to: Address;
  value?: BigNumberish;
  data?: BytesLike;
  gasLimit?: BigNumberish;
}

export const useHandleWcSend = () => {
  const [propose] = usePropose();

  return useCallback(
    async (
      client: SignClient,
      { id, topic, params }: WcEventParams['session_request'],
    ) => {
      const tx: SendTx = params.request.params[0];
      console.log(JSON.stringify({ params: tx }, null, 2));

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
            client.respond({
              topic,
              response: toWcResult(id, resp.hash),
            });
          });
        },
      );
    },
    [propose],
  );
};
