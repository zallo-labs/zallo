import { useCallback } from 'react';
import { popToProposal, usePropose } from '~/mutations/proposal/propose/usePropose';
import { toWcResult } from './jsonRcp';
import { WcSendTransactionData } from './methods/transaction';
import SignClient from '@walletconnect/sign-client';
import Connector from '@walletconnect/client';
import { QuorumGuid } from 'lib';
import { BigNumber } from 'ethers';
import { useRecoilCallback } from 'recoil';
import { SESSION_ACCOUNT_QUORUMS } from '~/screens/session-proposal/useSessionAccountQuorum';
import { assert } from 'console';

export const useHandleWcSend = () => {
  const [propose] = usePropose();

  return useRecoilCallback(
    ({ snapshot }) =>
      async (
        client: SignClient | Connector,
        id: number,
        topic: string | undefined,
        tx: WcSendTransactionData,
      ) => {
        const accountQuorums = await snapshot.getPromise(SESSION_ACCOUNT_QUORUMS(id));

        const key = accountQuorums[tx.from];
        assert(key);
        const quorum = { account: tx.from, key } as QuorumGuid;

        await propose(
          quorum,
          {
            to: tx.to,
            value: tx.value ? BigNumber.from(tx.value) : undefined,
            data: tx.data,
            gasLimit: tx.gasLimit ? BigNumber.from(tx.gasLimit) : undefined,
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
    [],
  );

  return useCallback(
    async (
      client: SignClient | Connector,
      id: number,
      topic: string | undefined,
      tx: WcSendTransactionData,
    ) => {
      const quorum = {
        account: tx.from,
      } as QuorumGuid;
      // TODO: use only quorum | navigate to select proposing quorum

      await propose(
        quorum,
        {
          to: tx.to,
          value: tx.value ? BigNumber.from(tx.value) : undefined,
          data: tx.data,
          gasLimit: tx.gasLimit ? BigNumber.from(tx.gasLimit) : undefined,
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
