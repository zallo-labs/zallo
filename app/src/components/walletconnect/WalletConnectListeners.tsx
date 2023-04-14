import { useEffect } from 'react';
import { showError } from '~/provider/SnackbarProvider';
import { SigningRequest, WC_SIGNING_METHODS } from '../../util/walletconnect/methods/signing';
import {
  WalletConnectSendTransactionRequest,
  WC_TRANSACTION_METHODS,
} from '../../util/walletconnect/methods/transaction';
import { useSessionPropsalListener } from './useSessionPropsalListener';
import { popToProposal, usePropose } from '@api/proposal';
import {
  useWalletConnect,
  WalletConnectEventArgs,
  asWalletConnectResult,
} from '~/util/walletconnect';
import { useNavigation } from '@react-navigation/native';

export const WalletConnectListeners = () => {
  const { navigate } = useNavigation();
  const client = useWalletConnect();
  const handleSessionProposal = useSessionPropsalListener();
  const propose = usePropose();

  useEffect(() => {
    const x = [
      [
        'session_proposal',
        (p: WalletConnectEventArgs['session_proposal']) => {
          handleSessionProposal(client, p);
        },
      ],
      [
        'session_request',
        ({ id, topic, params }: WalletConnectEventArgs['session_request']) => {
          const method = params.request.method;

          if (WC_SIGNING_METHODS.has(method)) {
            navigate('Sign', {
              topic,
              id,
              request: params.request as SigningRequest,
            });
          } else if (WC_TRANSACTION_METHODS.has(method)) {
            const [tx] = (params.request as WalletConnectSendTransactionRequest).params;

            propose(
              {
                to: tx.to,
                value: tx.value ? BigInt(tx.value) : undefined,
                data: tx.data,
                gasLimit: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
              },
              tx.from,
              (proposal, navigation) => {
                // TODO: handle response (onExecute)
                popToProposal(
                  proposal,
                  navigation /*, (resp) =>
                  client.respond({
                    topic: topic!,
                    response: asWalletConnectResult(id, resp.transactionHash),
                  }),*/,
                );
              },
            );
          } else {
            showError(`Unsupported WalletConnect request method: ${method}`);
          }
        },
      ],
    ] as const;

    client.on(...x[0]);
    client.on(...x[1]);
    // x.forEach((z) => c.on(...z)); // type error 🤷

    return () => {
      client.events.removeListener(...x[0]);
      client.events.removeListener(...x[1]);
    };
  }, [client, handleSessionProposal, navigate, propose]);

  return null;
};
