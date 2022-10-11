import '@walletconnect/react-native-compat'; // CRITICAL to import first
import SignClient from '@walletconnect/sign-client';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CONFIG } from '../config';
import { useEffect, useState } from 'react';
import { WcEventParams, WcSession, WcSessionRequesst } from './methods';
import { Link } from '../links';
import { showError } from '~/provider/SnackbarProvider';
import { WC_SIGNING_METHODS } from './methods/signing';
import { useHandleWcSend } from './useHandleWcSend';
import { WC_TRANSACTION_METHODS } from './methods/transaction';

export const WALLET_CONNECT_VERSION: SignClient['version'] = 2;

export const WALLET_CONNECT_SIGN_CLIENT = SignClient.init({
  projectId: CONFIG.walletConnectProjectId,
  metadata: {
    name: 'AlloPay',
    description: 'Smart wallet',
    url: Link.Site,
    icons: [Link.Icon],
  },
});

export const useHandleWalletConnectEvents = (c?: SignClient) => {
  const { navigate } = useRootNavigation();
  const handleSend = useHandleWcSend();

  useEffect(() => {
    if (!c) return;

    c.on('session_proposal', (proposal) =>
      navigate('SessionProposal', { proposal }),
    );
    c.on('session_request', (request: WcEventParams['session_request']) => {
      const session: WcSession = c.session.get(request.topic);
      const method = request.params.request.method;

      const params: WcSessionRequesst = {
        request,
        session,
      };

      if (WC_SIGNING_METHODS.has(method)) {
        return navigate('SessionSign', params);
      } else if (WC_TRANSACTION_METHODS.has(method)) {
        handleSend(c, request);
      } else {
        showError(`Unsupported WalletConnect request method: ${method}`);
      }
    });
    c.on('session_ping', (p) => console.log('session_ping', p));
    c.on('session_update', (p) => console.log('session_update', p));
    c.on('session_delete', (p) => console.log('session_delete', p));
    c.on('session_expire', (p) => console.log('session_expire', p));
    c.on('session_event', (p) => console.log('session_event', p));
    c.on('pairing_ping', (p) => console.log('pairing_ping', p));
    c.on('pairing_delete', (p) => console.log('pairing_delete', p));
    c.on('pairing_expire', (p) => console.log('pairing_expire', p));
    c.on('proposal_expire', (p) => console.log('proposal_expire', p));

    return () => {
      c.events.removeAllListeners();
    };
  }, [c, navigate]);
};
