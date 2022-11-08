import '@walletconnect/react-native-compat'; // CRITICAL to import first
import SignClient from '@walletconnect/sign-client';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CONFIG } from '../config';
import { useEffect } from 'react';
import { WcEventParams, WC_METHODS } from './methods';
import { Link } from '../links';
import { showError, showInfo } from '~/provider/SnackbarProvider';
import { SigningRequest, WC_SIGNING_METHODS } from './methods/signing';
import { useHandleWcSend } from './useHandleWcSend';
import { WcTransactionRequest, WC_TRANSACTION_METHODS } from './methods/transaction';
import { atom, useRecoilState } from 'recoil';
import { SignClientTypes } from '@walletconnect/types';
import { TopicV2 } from './useTopic';
import { useHandleSessionProposal } from '~/screens/session-proposal/useHandleSessionProposal';

export const WC_CLIENT_METADATA: SignClientTypes.Metadata = {
  name: 'AlloPay',
  description: 'Smart wallet',
  url: Link.Site,
  icons: [Link.Icon],
};

const SIGN_CLIENT = atom<SignClient>({
  key: 'walletConnectSignClient',
  default: SignClient.init({
    projectId: CONFIG.walletConnectProjectId,
    metadata: WC_CLIENT_METADATA,
  }),
  dangerouslyAllowMutability: true,
});

export const useWalletConnectV2 = () => {
  const { navigate } = useRootNavigation();
  const handleSessionProposal = useHandleSessionProposal();
  const handleSend = useHandleWcSend();

  const [c, setClient] = useRecoilState(SIGN_CLIENT);

  useEffect(() => {
    c.on('session_proposal', (proposal) => handleSessionProposal(c, proposal));
    c.on('session_request', ({ id, topic, params }: WcEventParams['session_request']) => {
      const method = params.request.method;

      if (WC_SIGNING_METHODS.has(method)) {
        navigate('Sign', {
          topic: topic as TopicV2,
          id,
          request: params.request as SigningRequest,
        });
      } else if (WC_TRANSACTION_METHODS.has(method)) {
        handleSend(c, id, topic, (params.request as WcTransactionRequest).params[0]);
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
  }, [c, handleSend, handleSessionProposal, navigate]);

  return [c, setClient] as const;
};
