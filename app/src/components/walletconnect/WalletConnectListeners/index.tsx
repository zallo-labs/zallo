import { useEffect } from 'react';
import { useSessionConnectionListener } from './useSessionConnectionListener';
import { useUpdateWalletConnect, useWalletConnectWithoutWatching } from '~/lib/wc';
import { useSessionRequestListener } from './useSessionRequestListener';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ISignClientEvents, SignClientTypes } from '@walletconnect/types';
import { logTrace } from '~/util/analytics';

function WalletConnectListeners_() {
  const client = useWalletConnectWithoutWatching();
  const update = useUpdateWalletConnect();

  useSessionConnectionListener();
  useSessionRequestListener();

  useEffect(() => {
    // https://specs.walletconnect.com/2.0/specs/clients/sign/session-events
    const emitter = client.engine.signClient.events;
    const handlers: Parameters<typeof emitter.on>[] = [
      ['session_update', update],
      ['session_extend', update],
      ['session_delete', update],
      ['session_expire', update],
      ...traceEvents(emitter, [
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

    handlers.forEach(([type, f]) => emitter.on(type, f));

    return () => {
      handlers.forEach(([type, f]) => emitter.off(type, f));
    };
  }, [client, update]);

  return null;
}

export const WalletConnectListeners = withSuspense(WalletConnectListeners_);

function traceEvents(client: ISignClientEvents, events: SignClientTypes.Event[]) {
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
