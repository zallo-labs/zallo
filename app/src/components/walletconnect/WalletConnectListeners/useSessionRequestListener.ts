import { gql } from '@api/generated';
import { asUAddress } from 'lib';
import { CHAINS } from 'chains';
import { useEffect } from 'react';
import { showError, showInfo } from '#/provider/SnackbarProvider';
import { logError } from '~/util/analytics';
import {
  asCaip2,
  asWalletConnectError,
  asWalletConnectResult,
  useWalletConnectWithoutWatching,
} from '~/lib/wc';
import { usePropose } from '@api/usePropose';
import { Observable } from 'rxjs';
import { SignClientTypes } from '@walletconnect/types';
import { useMutation } from 'urql';
import { useRouter } from 'expo-router';
import { normalizeSigningRequest, isSignatureRequest } from '~/lib/wc/methods/signing';
import { isTransactionRequest } from '~/lib/wc/methods/transaction';
import { useVerifyDapp } from '../DappVerification';
import { ApprovedProposal } from './useProposalsListener';
import { asDapp } from '~/lib/wc/uri';

const ProposeMessage = gql(/* GraphQL */ `
  mutation UseSessionRequestListener_ProposeMessage($input: ProposeMessageInput!) {
    proposeMessage(input: $input) {
      id
      signature
    }
  }
`);

type SessionRequestArgs = SignClientTypes.EventArguments['session_request'];

export interface UseSessionRequestListenerParams {
  proposals: Observable<ApprovedProposal>;
}

export const useSessionRequestListener = ({ proposals }: UseSessionRequestListenerParams) => {
  const router = useRouter();
  const client = useWalletConnectWithoutWatching();
  const proposeTransaction = usePropose();
  const proposeMessage = useMutation(ProposeMessage)[1];
  const verify = useVerifyDapp();

  useEffect(() => {
    const handleRequest = async ({ id, topic, params, verifyContext }: SessionRequestArgs) => {
      const chain = Object.values(CHAINS).find((c) => asCaip2(c) === params.chainId)?.key;
      if (!chain)
        return client.respondSessionRequest({
          topic,
          response: asWalletConnectError(id, 'UNSUPPORTED_CHAINS'),
        });

      verify(id, verifyContext.verified);
      const peer = client.getActiveSessions()[topic].peer.metadata;
      const dapp = asDapp(peer);

      const request = params.request;
      if (isTransactionRequest(request)) {
        const [tx] = request.params;

        const proposal = await proposeTransaction({
          account: asUAddress(tx.from, chain),
          operations: [
            {
              to: tx.to,
              value: tx.value ? BigInt(tx.value) : undefined,
              data: tx.data,
            },
          ],
          gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
          dapp,
        });
        if (!proposal) return;

        showInfo(`${dapp.name} has proposed a transaction`);

        const sub = proposals.subscribe((p) => {
          if (p.id === proposal && p.__typename === 'Transaction' && p.systx?.hash) {
            client.respondSessionRequest({
              topic,
              response: asWalletConnectResult(id, p.systx.hash),
            });
            sub.unsubscribe();
          }
        });

        router.push({ pathname: `/(nav)/transaction/[id]`, params: { id: proposal } });

        // sub is automatically unsubscribed on unmount due to proposals unsubscribe
      } else if (isSignatureRequest(request)) {
        const r = normalizeSigningRequest(request);

        const proposal = (
          await proposeMessage({
            input: {
              account: asUAddress(r.account, chain),
              label: `${dapp.name} message`,
              icon: dapp.icons[0],
              ...(r.method === 'personal-sign'
                ? { message: r.message }
                : { typedData: r.typedData }),
              dapp,
            },
          })
        ).data?.proposeMessage;
        if (!proposal) return showError(`${dapp.name}: failed to propose transaction`);

        // Respond immediately if message has previously been signed
        if (proposal.signature)
          return client.respondSessionRequest({
            topic,
            response: asWalletConnectResult(id, proposal.signature),
          });

        const sub = proposals.subscribe((p) => {
          if (p.id === proposal.id && p.__typename === 'Message' && p.signature) {
            client.respondSessionRequest({
              topic,
              response: asWalletConnectResult(id, p.signature),
            });
            sub.unsubscribe();
          }
        });

        router.push({ pathname: `/(nav)/message/[id]`, params: { id: proposal.id } });

        // sub is automatically unsubscribed on unmount due to proposals unsubscribe
      } else {
        logError('Unsupported session_request method executed', { params });
      }
    };

    client.on('session_request', handleRequest);

    return () => {
      client.off('session_request', handleRequest);
    };
  }, [client, router, proposals, proposeMessage, proposeTransaction, verify]);
};
