import { gql } from '@api/generated';
import { asUAddress } from 'lib';
import { CHAINS } from 'chains';
import { useEffect, useMemo } from 'react';
import { showError, showInfo } from '~/components/provider/SnackbarProvider';
import { logError } from '~/util/analytics';
import {
  asCaip2,
  asWalletConnectError,
  asWalletConnectResult,
  useWalletConnectWithoutWatching,
} from '~/lib/wc';
import { usePropose } from '@api/usePropose';
import { getOptimizedDocument, useQuery } from '~/gql';
import { Subject } from 'rxjs';
import { SignClientTypes } from '@walletconnect/types';
import { useMutation, useSubscription } from 'urql';
import { SessionRequestListener_ProposalSubscription } from '@api/generated/graphql';
import { useRouter } from 'expo-router';
import {
  WC_SIGNING_METHODS,
  normalizeSigningRequest,
  SigningRequest,
} from '~/lib/wc/methods/signing';
import {
  WC_TRANSACTION_METHODS,
  WalletConnectSendTransactionRequest,
} from '~/lib/wc/methods/transaction';
import { useVerifyDapp } from '../DappVerification';

const Query = gql(/* GraphQL */ `
  query UseSessionRequestListener {
    accounts {
      id
      address
    }
  }
`);

const ProposeMessage = gql(/* GraphQL */ `
  mutation UseSessionRequestListener_ProposeMessage($input: ProposeMessageInput!) {
    proposeMessage(input: $input) {
      id
      signature
    }
  }
`);

const ProposalSubscription = gql(/* GraphQL */ `
  subscription SessionRequestListener_Proposal($accounts: [UAddress!]!) {
    proposal(input: { accounts: $accounts, events: [approved, executed] }) {
      __typename
      id
      ... on TransactionProposal {
        transaction {
          id
          hash
        }
      }
      ... on MessageProposal {
        signature
      }
    }
  }
`);

type SessionRequestArgs = SignClientTypes.EventArguments['session_request'];

export const useSessionRequestListener = () => {
  const router = useRouter();
  const client = useWalletConnectWithoutWatching();
  const proposeTransaction = usePropose();
  const proposeMessage = useMutation(ProposeMessage)[1];
  const verify = useVerifyDapp();

  const accounts = useQuery(Query).data.accounts.map((a) => a.address);

  const proposals = useMemo(
    () => new Subject<SessionRequestListener_ProposalSubscription['proposal']>(),
    [],
  );
  useEffect(() => proposals.unsubscribe, [proposals]);

  useSubscription(
    { query: getOptimizedDocument(ProposalSubscription), variables: { accounts } },
    (_prev, data) => {
      proposals.next(data.proposal);
      return data;
    },
  );

  useEffect(() => {
    const handleRequest = async ({ id, topic, params, verifyContext }: SessionRequestArgs) => {
      const method = params.request.method;
      const dapp = client.getActiveSessions()[topic].peer.metadata;
      verify({ topic, id }, verifyContext.verified);

      const chain = Object.values(CHAINS).find((c) => asCaip2(c) === params.chainId)?.key;
      if (!chain)
        return client.respondSessionRequest({
          topic,
          response: asWalletConnectError(id, 'UNSUPPORTED_CHAINS'),
        });

      if (WC_TRANSACTION_METHODS.has(method)) {
        const [tx] = (params.request as WalletConnectSendTransactionRequest).params;

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
        });
        if (!proposal) return;

        showInfo(`${dapp.name} has proposed a transaction`);

        const sub = proposals.subscribe((p) => {
          if (p.id === proposal && p.__typename === 'TransactionProposal' && p.transaction?.hash) {
            client.respondSessionRequest({
              topic,
              response: asWalletConnectResult(id, p.transaction.hash),
            });
            sub.unsubscribe();
          }
        });

        router.push({ pathname: `/(drawer)/transaction/[id]`, params: { id: proposal } });

        // sub is automatically unsubscribed on unmount due to proposals unsubscribe
      } else if (WC_SIGNING_METHODS.has(method)) {
        const request = normalizeSigningRequest(params.request as SigningRequest);

        const proposal = (
          await proposeMessage({
            input: {
              account: asUAddress(request.account, chain),
              label: `${dapp.name} message`,
              iconUri: dapp.icons[0],
              ...(request.method === 'personal-sign'
                ? { message: request.message }
                : { typedData: request.typedData }),
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

        showInfo(`${dapp.name} wants you to sign a message`);

        const sub = proposals.subscribe((p) => {
          if (p.id === proposal.id && p.__typename === 'MessageProposal' && p.signature) {
            client.respondSessionRequest({
              topic,
              response: asWalletConnectResult(id, p.signature),
            });
            sub.unsubscribe();
          }
        });

        router.push({ pathname: `/(drawer)/message/[id]`, params: { id: proposal.id } });

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
