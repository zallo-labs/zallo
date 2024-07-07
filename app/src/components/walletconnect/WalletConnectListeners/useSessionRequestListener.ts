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
import { useProposeTransaction } from '~/hooks/mutations/useProposeTransaction';
import { Observable } from 'rxjs';
import { SignClientTypes } from '@walletconnect/types';
import { useRouter } from 'expo-router';
import { normalizeSigningRequest, isSignatureRequest } from '~/lib/wc/methods/signing';
import { isTransactionRequest } from '~/lib/wc/methods/transaction';
import { useVerifyDapp } from '../DappVerification';
import { ApprovedProposal } from './useProposalsListener';
import { asDapp } from '~/lib/wc/uri';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { useSessionRequestListenerQuery } from '~/api/__generated__/useSessionRequestListenerQuery.graphql';
import { useProposeMessage } from '~/hooks/mutations/useProposeMessage';

const Query = graphql`
  query useSessionRequestListenerQuery {
    accounts {
      address
      ...useProposeTransaction_account
      ...useProposeMessage_account
    }
  }
`;

type SessionRequestArgs = SignClientTypes.EventArguments['session_request'];

export interface UseSessionRequestListenerParams {
  proposals: Observable<ApprovedProposal>;
}

export const useSessionRequestListener = ({ proposals }: UseSessionRequestListenerParams) => {
  const router = useRouter();
  const client = useWalletConnectWithoutWatching();
  const verify = useVerifyDapp();
  const proposeTransaction = useProposeTransaction();
  const proposeMessage = useProposeMessage();

  const { accounts } = useLazyLoadQuery<useSessionRequestListenerQuery>(Query, {});

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

        const accountAddress = asUAddress(tx.from, chain);
        const account = accounts.find((a) => a.address === accountAddress);
        if (!account) return showError('Account not found');

        const proposal = await proposeTransaction(account, {
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

        const accountAddress = asUAddress(r.account, chain);
        const account = accounts.find((a) => a.address === accountAddress);
        if (!account) return showError('Account not found');

        const proposal = await proposeMessage(account, {
          label: `${dapp.name} message`,
          icon: dapp.icons[0],
          ...(r.method === 'personal-sign' ? { message: r.message } : { typedData: r.typedData }),
          dapp,
        });
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
  }, [client, router, proposals, proposeMessage, proposeTransaction, verify, accounts]);
};
