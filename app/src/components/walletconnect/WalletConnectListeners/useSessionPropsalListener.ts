import { getSdkError } from '@walletconnect/utils';
import { useEffect } from 'react';
import { showError } from '~/components/provider/SnackbarProvider';
import { WC_METHODS } from '~/util/walletconnect/methods';
import {
  WC_NAMESPACE_KEY,
  WC_SUPPORTED_CHAINS,
  useWalletConnectWithoutWatching,
} from '~/util/walletconnect';
import { isPresent } from 'lib';
import { SignClientTypes } from '@walletconnect/types';
import { useRouter } from 'expo-router';

type SessionProposalArgs = SignClientTypes.EventArguments['session_proposal'];

export const useSessionPropsalListener = () => {
  const router = useRouter();
  const client = useWalletConnectWithoutWatching();

  useEffect(() => {
    const handleProposal = async (proposal: SessionProposalArgs) => {
      const { requiredNamespaces, optionalNamespaces } = proposal.params;
      const proposer = proposal.params.proposer.metadata;

      // Check that at least one chain is supported
      const peerChains = [
        ...(requiredNamespaces[WC_NAMESPACE_KEY]?.chains ?? []),
        ...(optionalNamespaces[WC_NAMESPACE_KEY]?.chains ?? []),
      ];

      if (!peerChains.some((chain) => WC_SUPPORTED_CHAINS.includes(chain))) {
        showError("DApp doesn't support any zkSync network");
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_CHAINS') });
      }

      // Check that all required chains are supported
      const requiredChains = Object.values(requiredNamespaces)
        .flatMap((ns) => ns.chains)
        .filter(isPresent);

      const unsupportedChains = requiredChains.filter(
        (chain) => !WC_SUPPORTED_CHAINS.includes(chain),
      );
      if (unsupportedChains.length) {
        showError('DApp requires unsupported networks');
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_CHAINS') });
      }

      const namespace =
        requiredNamespaces[WC_NAMESPACE_KEY] ?? optionalNamespaces[WC_NAMESPACE_KEY];

      // Check required methods
      const unsupportedMethods = namespace.methods.filter((method) => !WC_METHODS.has(method));
      if (unsupportedMethods.length) {
        showError('DApp requires unsupported methods', {
          event: { proposer, unsupportedMethods },
        });
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_METHODS') });
      }

      router.push({ pathname: `/sessions/connect/[id]`, params: { id: proposal.id } });
    };

    client.on('session_proposal', handleProposal);

    return () => {
      client.off('session_proposal', handleProposal);
    };
  }, [client, router.push]);
};
