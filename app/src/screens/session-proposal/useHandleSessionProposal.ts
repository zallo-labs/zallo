import { CHAIN_ID } from '@network/provider';
import SignClient from '@walletconnect/sign-client';
import { getSdkError } from '@walletconnect/utils';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { showError } from '~/provider/SnackbarProvider';
import { WcEventParams, WC_METHODS } from '~/util/walletconnect/methods';
import { WC_NAMESPACE } from '~/util/walletconnect/namespaces';

export const useHandleSessionProposal = () => {
  const { navigate } = useRootNavigation();

  return useCallback(
    (client: SignClient, proposal: WcEventParams['session_proposal']) => {
      // Check required namespaces
      const usNamespaces = Object.keys(proposal.params.requiredNamespaces).filter(
        (ns) => ns !== WC_NAMESPACE,
      );
      if (usNamespaces) {
        showError('Session requires unsupported namespaces', {
          event: {
            extra: {
              proposal,
              unsupportedNamespaces: usNamespaces,
            },
          },
        });
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_NAMESPACE_KEY') });
      }

      // Check required chains
      const namespace = proposal.params.requiredNamespaces[WC_NAMESPACE];
      const chain = `${CHAIN_ID()}`;
      const usChains = namespace.chains.filter((c) => c !== chain);
      if (usChains) {
        showError('Session requires unsupported chains', {
          event: {
            extra: {
              proposal,
              unsupportedChains: usChains,
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
            extra: {
              proposal,
              unsupportedMethods: usMethods,
            },
          },
        });
        return client.reject({ id: proposal.id, reason: getSdkError('UNSUPPORTED_METHODS') });
      }

      navigate('SessionProposal', {
        id: proposal.id,
        proposer: proposal.params.proposer.metadata,
      });
    },
    [navigate],
  );
};
