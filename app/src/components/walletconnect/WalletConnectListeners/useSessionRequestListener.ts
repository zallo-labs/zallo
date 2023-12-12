import { gql } from '@api/generated';
import { asUAddress } from 'lib';
import { CHAINS } from 'chains';
import { useEffect, useMemo } from 'react';
import { showError, showInfo } from '~/components/provider/SnackbarProvider';
import { logError } from '~/util/analytics';
import {
  asWalletConnectError,
  asWalletConnectResult,
  useWalletConnectWithoutWatching,
} from '~/util/walletconnect';
import {
  SigningRequest,
  WC_SIGNING_METHODS,
  WC_TRANSACTION_METHODS,
  WalletConnectSendTransactionRequest,
  normalizeSigningRequest,
} from '~/util/walletconnect/methods';
import { usePropose } from '@api/usePropose';
import { getOptimizedDocument, useQuery } from '~/gql';
import { Subject } from 'rxjs';
import { SignClientTypes } from '@walletconnect/types';
import { useMutation, useSubscription } from 'urql';
import { SessionRequestListener_ProposalSubscription } from '@api/generated/graphql';
import { useRouter } from 'expo-router';

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
      hash
      signature
    }
  }
`);

const ProposalSubscription = gql(/* GraphQL */ `
  subscription SessionRequestListener_Proposal($accounts: [UAddress!]!) {
    proposal(input: { accounts: $accounts, events: [approved, executed] }) {
      __typename
      id
      hash
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
          if (
            p.hash === proposal &&
            p.__typename === 'TransactionProposal' &&
            p.transaction?.hash
          ) {
            client.respond({ topic, response: asWalletConnectResult(id, p.transaction.hash) });
            sub.unsubscribe();
          }
        });

        router.push({ pathname: `/(drawer)/transaction/[hash]/`, params: { hash: proposal } });

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
          if (p.hash === proposal.hash && p.__typename === 'MessageProposal' && p.signature) {
            client.respond({ topic, response: asWalletConnectResult(id, p.signature) });
            sub.unsubscribe();
          }
        });

        router.push({ pathname: `/(drawer)/message/[hash]/`, params: { hash: proposal.hash } });

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
