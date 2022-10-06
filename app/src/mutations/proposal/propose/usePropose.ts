import { CommonActions } from '@react-navigation/native';
import { Address, TxDef } from 'lib';
import { useCallback, useState } from 'react';
import {
  RootNavigation,
  toNavigationStateRoutes,
  useRootNavigation,
} from '~/navigation/useRootNavigation';
import { showInfo } from '~/provider/SnackbarProvider';
import { ProposalId } from '~/queries/proposal';
import { useApiPropose } from './usePropose.api';

export type OnPropose = (
  proposal: ProposalId,
  navigation: RootNavigation,
) => Promise<void> | void;

export const usePropose = () => {
  const navigation = useRootNavigation();
  const apiPropose = useApiPropose();

  const [proposing, setProposing] = useState(false);

  const propose = useCallback(
    async (account: Address, tx: TxDef, onPropose?: OnPropose) => {
      setProposing(true);

      const proposal = await apiPropose(tx, account);
      const id: ProposalId = { hash: proposal.hash };

      await onPropose?.(id, navigation);

      setProposing(false);
    },
    [navigation, apiPropose],
  );

  return [propose, proposing] as const;
};

export const popToProposal = (
  proposal: ProposalId,
  navigation: RootNavigation,
) =>
  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: toNavigationStateRoutes(
        {
          name: 'DrawerNavigator',
          params: undefined,
        },
        {
          name: 'Transaction',
          params: { id: proposal },
        },
      ),
    }),
  );

export const showProposalSnack = (
  ...params: Parameters<typeof popToProposal>
) => {
  showInfo('Proposal created', {
    action: {
      label: 'View proposal',
      onPress: () => popToProposal(...params),
    },
    visibilityTime: 8000,
  });
};
