import { QuorumGuid, TxOptions } from 'lib';
import { useCallback, useState } from 'react';
import { RootNavigation, useRootNavigation } from '~/navigation/useRootNavigation';
import { showInfo } from '~/provider/SnackbarProvider';
import { ProposalId } from '~/queries/proposal';
import { OnExecute } from '~/screens/proposal/ProposalActions';
import { ProposeResponse, useApiPropose } from './usePropose.api';

export type OnPropose = (
  proposal: ProposeResponse,
  navigation: RootNavigation,
) => Promise<void> | void;

export const usePropose = () => {
  const navigation = useRootNavigation();
  const propose = useApiPropose();

  const [proposing, setProposing] = useState(false);

  const p = useCallback(
    async (quorum: QuorumGuid, txOpts: TxOptions, onPropose?: OnPropose) => {
      setProposing(true);

      const proposal = await propose(txOpts, quorum);

      await onPropose?.(proposal, navigation);
      setProposing(false);

      return proposal;
    },
    [navigation, propose],
  );

  return [p, proposing] as const;
};

export const popToProposal = (
  proposal: ProposalId,
  navigation: RootNavigation,
  onExecute?: OnExecute,
) => navigation.replace('Proposal', { proposal, onExecute });

export const showProposalSnack = (...params: Parameters<typeof popToProposal>) => {
  showInfo('Proposal created', {
    action: {
      label: 'View proposal',
      onPress: () => popToProposal(...params),
    },
    visibilityTime: 8000,
  });
};
