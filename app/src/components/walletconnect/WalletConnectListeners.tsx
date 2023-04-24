import { useEffect } from 'react';
import { useSessionPropsalListener } from './useSessionPropsalListener';
import { useWalletConnect } from '~/util/walletconnect';
import { useSessionRequestListener } from './useSessionRequestListener';
import { withSuspense } from '../skeleton/withSuspense';

export const WalletConnectListeners = withSuspense(
  () => {
    const client = useWalletConnect();
    const handleSessionProposal = useSessionPropsalListener();
    const handleSessionRequest = useSessionRequestListener();

    useEffect(() => {
      const handlers = [
        [
          'session_proposal',
          (p) => {
            handleSessionProposal(client, p);
          },
        ] as Parameters<typeof client.on<'session_proposal'>>,
        [
          'session_request',
          (event) => {
            handleSessionRequest(client, event);
          },
        ] as Parameters<typeof client.on<'session_request'>>,
      ] as const;

      handlers.forEach(([type, f]) => client.on(type, f as any)); // type error 🤷

      return () => {
        handlers.forEach(([type, f]) => client.off(type, f as any)); // type error 🤷
      };
    }, [client?.on, handleSessionProposal, handleSessionRequest]);

    return null;
  },
  () => null,
);
