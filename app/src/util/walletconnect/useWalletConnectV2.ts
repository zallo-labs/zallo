import '@walletconnect/react-native-compat'; // CRITICAL to import first
import SignClient from '@walletconnect/sign-client';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CONFIG } from '../config';
import { useEffect } from 'react';
import { WcEventParams } from './methods';
import { Link } from '../links';
import { showError } from '~/provider/SnackbarProvider';
import { SigningRequest, WC_SIGNING_METHODS } from './methods/signing';
import { useHandleWcSend } from './useHandleWcSend';
import { WcTransactionRequest, WC_TRANSACTION_METHODS } from './methods/transaction';
import { atom, useRecoilState } from 'recoil';
import { SignClientTypes } from '@walletconnect/types';
import { TopicV2 } from './useTopic';
import { useHandleSessionProposal } from '~/screens/session-proposal/useHandleSessionProposal';

export const WC_CLIENT_METADATA: SignClientTypes.Metadata = {
  name: 'Zallo',
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
    const x = [
      ['session_proposal', (p: WcEventParams['session_proposal']) => handleSessionProposal(c, p)],
      [
        'session_request',
        ({ id, topic, params }: WcEventParams['session_request']) => {
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
        },
      ],
    ] as const;

    c.on(...x[0]);
    c.on(...x[1]);
    // x.forEach((z) => c.on(...z));  // type error 🤷

    return () => {
      c.events.removeListener(...x[0]);
      c.events.removeListener(...x[1]);
    };
  }, [c, handleSend, handleSessionProposal, navigate]);

  return [c, setClient] as const;
};
