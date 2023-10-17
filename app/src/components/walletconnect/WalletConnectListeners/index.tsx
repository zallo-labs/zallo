import { useEffect } from 'react';
import { useSessionPropsalListener } from './useSessionPropsalListener';
import { useUpdateWalletConnect, useWalletConnectWithoutWatching } from '~/util/walletconnect';
import { useSessionRequestListener } from './useSessionRequestListener';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { SignClientTypes } from '@walletconnect/types';
import { SignClient } from '@walletconnect/sign-client/dist/types/client';
import { logTrace } from '~/util/analytics';

export const WalletConnectListeners = withSuspense(
  () => {
    const client = useWalletConnectWithoutWatching();
    const update = useUpdateWalletConnect();

    useSessionPropsalListener();
    useSessionRequestListener();

    useEffect(() => {
      // https://specs.walletconnect.com/2.0/specs/clients/sign/session-events
      const handlers: Parameters<typeof client.on>[] = [
        ['session_update', update],
        ['session_extend', update],
        ['session_delete', update],
        ['session_expire', update],
        ...traceEvents(client, [
          'session_proposal',
          'session_update',
          'session_extend',
          'session_delete',
          'session_expire',
          'session_request_sent',
          'session_event',
          'proposal_expire',
        ]),
      ];

      handlers.forEach(([type, f]) => client.on(type, f));

      return () => {
        handlers.forEach(([type, f]) => client.off(type, f));
      };
    }, [client, update]);

    return null;
  },
  () => null,
);

function traceEvents(client: SignClient, events: SignClientTypes.Event[]) {
  return events.map(
    (event) =>
      [
        event,
        (args) =>
          logTrace(`WalletConnect`, {
            event,
            params: 'params' in args ? args.params : undefined,
          }),
      ] as Parameters<typeof client.on>,
  );
}
