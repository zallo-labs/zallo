import { gql } from '@api/generated';
import { useNavigation } from '@react-navigation/native';
import { Hex, asBigInt } from 'lib';
import { useCallback } from 'react';
import { showInfo } from '~/provider/SnackbarProvider';
import { logError } from '~/util/analytics';
import { WalletConnectEventArgs, WcClient, asWalletConnectResult } from '~/util/walletconnect';
import {
  SigningRequest,
  WC_SIGNING_METHODS,
  WC_TRANSACTION_METHODS,
  WalletConnectSendTransactionRequest,
} from '~/util/walletconnect/methods';
import { EventEmitter } from '~/util/EventEmitter';
import { usePropose } from '@api/usePropose';
import { useQuery } from '~/gql';
import { useSubscription } from 'urql';

const PROPOSAL_EXECUTED_EMITTER = new EventEmitter<Hex>('Proposal::exeucte');

const Query = gql(/* GraphQL */ `
  query UseSessionRequestListener {
    accounts {
      id
      address
    }
  }
`);

const Subscription = gql(/* GraphQL */ `
  subscription SessionRequestListener($accounts: [Address!]!) {
    proposal(input: { accounts: $accounts, events: [executed] }) {
      id
      hash
    }
  }
`);

export const useSessionRequestListener = () => {
  const { navigate } = useNavigation();
  const propose = usePropose();

  const { accounts } = useQuery(Query).data;
  useSubscription({
    query: Subscription,
    variables: { accounts: accounts.map((a) => a.address) },
  });

  return useCallback(
    async (client: WcClient, { id, topic, params }: WalletConnectEventArgs['session_request']) => {
      const method = params.request.method;

      if (WC_SIGNING_METHODS.has(method)) {
        navigate('Sign', {
          topic,
          id,
          request: params.request as SigningRequest,
        });
      } else if (WC_TRANSACTION_METHODS.has(method)) {
        const [tx] = (params.request as WalletConnectSendTransactionRequest).params;

        const peer = client.session.get(topic).peer.metadata;
        showInfo(`${peer.name} has proposed a transaction`);

        const proposal = await propose({
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

        PROPOSAL_EXECUTED_EMITTER.listeners.add((proposalHash) => {
          if (proposalHash === proposal) {
            client.respond({
              topic,
              response: asWalletConnectResult(id, proposalHash),
            });
          }
        });

        navigate('Proposal', { proposal });
      } else {
        logError('Unsupported session_request method executed', { params });
      }
    },
    [navigate, propose],
  );
};
