import { useCallback } from 'react';
import Connector from '@walletconnect/client';
import { WC_CLIENT_METADATA } from './useWalletConnectV2';
import { useWalletConnectClients } from './WalletConnectProvider';
import { showError } from '~/provider/SnackbarProvider';
import { SessionProposalV1, SessionRequestV1 } from './methods/typesV1';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { SigningRequest, WC_SIGNING_METHODS } from './methods/signing';
import { useHandleWcSend } from './useHandleWcSend';
import {
  WcSendTransactionData,
  WC_TRANSACTION_METHODS,
} from './methods/transaction';
import { TopicV1 } from './useTopic';

const URI_PATTERN = /^wc:[0-9a-f-]*@1\?/;
export const isWalletConnectUriV1 = (uri: string) => !!URI_PATTERN.exec(uri);

export const usePairWalletConnectV1 = () => {
  const { navigate } = useRootNavigation();
  const { connectionsV1, updateConnectionsV1 } = useWalletConnectClients();
  const handleSend = useHandleWcSend();

  return useCallback(
    (uri: string) => {
      if (connectionsV1.has(uri)) return;

      const c = new Connector({
        uri,
        clientMeta: WC_CLIENT_METADATA,
      });

      c.on('session_request', (error, proposal: SessionProposalV1) => {
        if (error) return showError('Failed to pair with WalletConnect');

        navigate('SessionProposal', {
          uri,
          id: proposal.id,
          proposer: proposal.params[0].peerMeta,
        });
      });

      c.on(
        'call_request',
        (error, { id, method, params }: SessionRequestV1) => {
          if (error) return showError('Failed handle WalletConnect request');

          if (WC_SIGNING_METHODS.has(method)) {
            navigate('Sign', {
              topic: uri as TopicV1,
              id,
              request: { method, params } as SigningRequest,
            });
          } else if (WC_TRANSACTION_METHODS.has(method)) {
            handleSend(c, id, undefined, params[0] as WcSendTransactionData);
          } else {
            showError(`Unsupported WalletConnect request method: ${method}`);
          }
        },
      );

      c.on('disconnect', () => {
        updateConnectionsV1((connections) => {
          connections.delete(uri);
        });
      });

      updateConnectionsV1((connections) => {
        connections.set(uri, c);
      });
    },
    [connectionsV1, handleSend, navigate, updateConnectionsV1],
  );
};
