import { useEffect } from 'react';
import { useSessionPropsalListener } from './useSessionPropsalListener';
import { useUpdateWalletConnect, useWalletConnectWithoutWatching } from '~/util/walletconnect';
import { useSessionRequestListener } from './useSessionRequestListener';
import { withSuspense } from '../skeleton/withSuspense';

export const WalletConnectListeners = withSuspense(
  () => {
    const client = useWalletConnectWithoutWatching();
    const update = useUpdateWalletConnect();
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
        ['session_update', update] as Parameters<typeof client.on<'session_update'>>,
        ['session_expire', update] as Parameters<typeof client.on<'session_expire'>>,
        ['session_delete', update] as Parameters<typeof client.on<'session_delete'>>,
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
