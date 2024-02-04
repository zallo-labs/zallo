import { getSdkError } from '@walletconnect/utils';
import { useEffect, useRef } from 'react';
import { showError } from '~/components/provider/SnackbarProvider';
import { useWalletConnectWithoutWatching, sessionChains } from '~/lib/wc';
import { useRouter, usePathname, Route } from 'expo-router';
import { Web3WalletTypes } from '@walletconnect/web3wallet';
import { useVerifyDapp } from '../DappVerification';

type SessionProposalArgs = Web3WalletTypes.EventArguments['session_proposal'];

export const useSessionConnectionListener = () => {
  const router = useRouter();
  const client = useWalletConnectWithoutWatching();
  const verify = useVerifyDapp();

  const pathnameHook = usePathname();
  const pathname = useRef(pathnameHook);
  useEffect(() => {
    pathname.current = pathnameHook;
  }, [pathnameHook]);

  useEffect(() => {
    const handler = async ({ id, params: proposal, verifyContext }: SessionProposalArgs) => {
      const dapp = proposal.proposer.metadata.name;
      verify(id, verifyContext.verified);

      const chains = sessionChains(proposal);
      if (!chains.length) {
        showError(`${dapp} requires unsupported networks`);
        return client.rejectSession({ id, reason: getSdkError('UNSUPPORTED_CHAINS') });
      }

      const href = { pathname: `/(sheet)/sessions/connect/[id]`, params: { id } } as const;
      pathname.current === ('/wc' satisfies Route<''>) ? router.replace(href) : router.push(href);
    };

    client.on('session_proposal', handler);

    return () => {
      client.off('session_proposal', handler);
    };
  }, [client, router, verify]);
};
