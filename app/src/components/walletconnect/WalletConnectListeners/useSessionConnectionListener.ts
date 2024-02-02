import { getSdkError } from '@walletconnect/utils';
import { useEffect } from 'react';
import { showError } from '~/components/provider/SnackbarProvider';
import { useWalletConnectWithoutWatching, sessionChains } from '~/lib/wc';
import { useRouter } from 'expo-router';
import { Web3WalletTypes } from '@walletconnect/web3wallet';

type SessionProposalArgs = Web3WalletTypes.EventArguments['session_proposal'];

export const useSessionConnectionListener = () => {
  const router = useRouter();
  const client = useWalletConnectWithoutWatching();

  useEffect(() => {
    const handler = async ({ id, params: proposal }: SessionProposalArgs) => {
      const dapp = proposal.proposer.metadata.name;

      const chains = sessionChains(proposal);
      if (!chains.length) {
        showError(`${dapp} requires unsupported networks`);
        return client.rejectSession({ id, reason: getSdkError('UNSUPPORTED_CHAINS') });
      }

      router.push({ pathname: `/(sheet)/sessions/connect/[id]`, params: { id } });
    };

    client.on('session_proposal', handler);

    return () => {
      client.off('session_proposal', handler);
    };
  }, [client, router]);
};
