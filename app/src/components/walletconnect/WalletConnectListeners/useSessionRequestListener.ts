import { useEffect, useMemo } from 'react';
import { SignClientTypes } from '@walletconnect/types';
import { useRouter } from 'expo-router';
import { Subject } from 'rxjs';
import { useMutation, useSubscription } from 'urql';

import { CHAINS } from 'chains';
import { asUAddress } from 'lib';
import { showError, showInfo } from '~/components/provider/SnackbarProvider';
import { getOptimizedDocument, useQuery } from '~/gql';
import { gql } from '~/gql/api/generated';
import { SessionRequestListener_ProposalSubscription } from '~/gql/api/generated/graphql';
import { usePropose } from '~/gql/api/usePropose';
import { logError } from '~/util/analytics';
import {
  asWalletConnectError,
  asWalletConnectResult,
  useWalletConnectWithoutWatching,
} from '~/util/walletconnect';
import {
  normalizeSigningRequest,
  SigningRequest,
  WalletConnectSendTransactionRequest,
  WC_SIGNING_METHODS,
  WC_TRANSACTION_METHODS,
} from '~/util/walletconnect/methods';

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
  const proposeTransaction = usePropose();
  const proposeMessage = useMutation(ProposeMessage)[1];
  const client = useWalletConnectWithoutWatching();

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
    const handleRequest = async ({ id, topic, params }: SessionRequestArgs) => {
      const method = params.request.method;
      const peer = client.session.get(topic).peer.metadata;

      const chain = Object.values(CHAINS).find((c) => `${c.id}` === params.chainId)?.key;
      if (!chain)
        return client.respond({
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

        showInfo(`${peer.name} has proposed a transaction`);

        const sub = proposals.subscribe((p) => {
          if (p.id === proposal && p.__typename === 'TransactionProposal' && p.transaction?.hash) {
            client.respond({ topic, response: asWalletConnectResult(id, p.transaction.hash) });
            sub.unsubscribe();
          }
        });

        router.push({ pathname: `/(drawer)/transaction/[id]/`, params: { id: proposal } });

        // sub is automatically unsubscribed on unmount due to proposals unsubscribe
      } else if (WC_SIGNING_METHODS.has(method)) {
        const request = normalizeSigningRequest(params.request as SigningRequest);

        const proposal = (
          await proposeMessage({
            input: {
              account: asUAddress(request.account, chain),
              label: `${peer.name} message`,
              iconUri: peer.icons[0],
              ...(request.method === 'personal-sign'
                ? { message: request.message }
                : { typedData: request.typedData }),
            },
          })
        ).data?.proposeMessage;
        if (!proposal) return showError(`${peer.name}: failed to propose transaction`);

        // Respond immediately if message has previously been signed
        if (proposal.signature)
          return client.respond({ topic, response: asWalletConnectResult(id, proposal.signature) });

        showInfo(`${peer.name} wants you to sign a message`);

        const sub = proposals.subscribe((p) => {
          if (p.id === proposal.id && p.__typename === 'MessageProposal' && p.signature) {
            client.respond({ topic, response: asWalletConnectResult(id, p.signature) });
            sub.unsubscribe();
          }
        });

        router.push({ pathname: `/(drawer)/message/[id]/`, params: { id: proposal.id } });

        // sub is automatically unsubscribed on unmount due to proposals unsubscribe
      } else {
        logError('Unsupported session_request method executed', { params });
      }
    };

    client.on('session_request', handleRequest);

    return () => {
      client.off('session_request', handleRequest);
    };
  }, [client, router, proposals, proposeMessage, proposeTransaction]);
};
