import { CHAIN_ID } from '@network/provider';
import { getSdkError } from '@walletconnect/utils';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { showError } from '~/provider/SnackbarProvider';
import { WC_METHODS } from '~/util/walletconnect/methods';
import { WcClient, WalletConnectEventArgs, WC_NAMESPACE } from '~/util/walletconnect';

export const useSessionPropsalListener = () => {
  const { navigate } = useNavigation();

  return useCallback(
    (client: WcClient, proposal: WalletConnectEventArgs['session_proposal']) => {
      // Check required namespaces
      const usNamespaces = Object.keys(proposal.params.requiredNamespaces).filter(
        (ns) => ns !== WC_NAMESPACE,
      );
      if (usNamespaces) {
        showError('Session requires unsupported namespaces', {
          event: {
            context: {
              proposal,
              unsupportedNamespaces: usNamespaces,
            },
          },
        });
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_NAMESPACE_KEY') });
      }

      // Check required chains
      const namespace = proposal.params.requiredNamespaces[WC_NAMESPACE];
      if (!namespace) {
        showError("Session doesn't support Ethereum", {
          event: {
            context: {
              proposal,
            },
          },
        });
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_NAMESPACE_KEY') });
      }

      const chain = `${CHAIN_ID()}`;
      const unsupportedChains = namespace.chains?.filter((c) => c !== chain);
      if (unsupportedChains) {
        showError('Session requires unsupported chains', {
          event: {
            context: {
              proposal,
              unsupportedChains,
            },
          },
        });
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_CHAINS') });
      }

      // Check required methods
      const usMethods = namespace.methods.filter((method) => !WC_METHODS.has(method));
      if (usMethods.length) {
        showError('Session requires unsupported methods', {
          event: {
            context: {
              proposal,
              unsupportedMethods: usMethods,
            },
          },
        });
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_METHODS') });
      }

      navigate('SessionProposal', {
        id: proposal.id,
        peer: proposal.params.proposer.metadata,
      });
    },
    [navigate],
  );
};
