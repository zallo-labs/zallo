import { popToProposal, usePropose } from '@api/proposal';
import { useNavigation } from '@react-navigation/native';
import { asBigInt } from 'lib';
import { useCallback } from 'react';
import { showError } from '~/provider/SnackbarProvider';
import { WalletConnectEventArgs, WcClient } from '~/util/walletconnect';
import {
  SigningRequest,
  WC_SIGNING_METHODS,
  WC_TRANSACTION_METHODS,
  WalletConnectSendTransactionRequest,
} from '~/util/walletconnect/methods';

export const useSessionRequestListener = () => {
  const { navigate } = useNavigation();
  const propose = usePropose();

  return useCallback(
    (client: WcClient, { id, topic, params }: WalletConnectEventArgs['session_request']) => {
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
            value: tx.value ? asBigInt(tx.value) : undefined,
            data: tx.data,
            gasLimit: tx.gasLimit ? asBigInt(tx.gasLimit) : undefined,
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

        // TODO: handle response
        // Listen for ExecutionEvent (event data should include transaction hash)
        // Response when found
        // Show error:
        // - 2 minutes before timeout
        // - on timeout
      } else {
        showError(`Unsupported WalletConnect request method: ${method}`);
      }
    },
    [navigate, propose],
  );
};
