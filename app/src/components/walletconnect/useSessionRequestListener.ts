import { gql } from '@api/generated';
import { useNavigation } from '@react-navigation/native';
import { asBigInt } from 'lib';
import { useEffect, useState } from 'react';
import { showInfo } from '~/provider/SnackbarProvider';
import { logError } from '~/util/analytics';
import { asWalletConnectResult, useWalletConnectWithoutWatching } from '~/util/walletconnect';
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
    }
  }
`);

const ProposalSubscription = gql(/* GraphQL */ `
  subscription SessionRequestListener_Proposal($accounts: [Address!]!) {
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
  const { navigate } = useNavigation();
  const proposeTransaction = usePropose();
  const proposeMessage = useMutation(ProposeMessage)[1];
  const client = useWalletConnectWithoutWatching();

  const accounts = useQuery(Query).data.accounts.map((a) => a.address);

  const [proposals] = useState(
    new Subject<SessionRequestListener_ProposalSubscription['proposal']>(),
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

      if (WC_TRANSACTION_METHODS.has(method)) {
        const [tx] = (params.request as WalletConnectSendTransactionRequest).params;

        const proposal = await proposeTransaction({
          account: tx.from,
          operations: [
            {
              to: tx.to,
              value: tx.value ? asBigInt(tx.value) : undefined,
              data: tx.data,
            },
          ],
          gasLimit: tx.gasLimit ? asBigInt(tx.gasLimit) : undefined,
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

        navigate('Proposal', { proposal });

        // sub is automatically unsubscribed due to proposalsExecuted unsubscribe on unmount
      } else if (WC_SIGNING_METHODS.has(method)) {
        const request = params.request as SigningRequest;
        const { account, message } = normalizeSigningRequest(request);

        // TODO: handle EIP712 messages
        if (typeof message !== 'string') throw new Error('EIP712 signing unimplemented!');

        const proposal = (
          await proposeMessage({
            input: {
              account,
              message,
              label: `${peer.name} signature request`,
              iconUri: peer.icons[0],
            },
          })
        ).data?.proposeMessage.hash;
        if (!proposal) return;

        showInfo(`${peer.name} has requested a signature`);

        const sub = proposals.subscribe((p) => {
          if (p.hash === proposal && p.__typename === 'MessageProposal' && p.signature) {
            client.respond({ topic, response: asWalletConnectResult(id, p.signature) });
            sub.unsubscribe();
          }
        });

        navigate('MessageProposal', { proposal });

        // sub is automatically unsubscribed due to proposalsApproved unsubscribe on unmount
      } else {
        logError('Unsupported session_request method executed', { params });
      }
    };

    client.on('session_request', handleRequest);

    return () => {
      client.off('session_request', handleRequest);
    };
  }, [client, navigate, proposals, proposeMessage, proposeTransaction]);
};
