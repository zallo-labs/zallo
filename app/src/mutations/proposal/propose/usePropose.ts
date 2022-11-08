import { CommonActions } from '@react-navigation/native';
import { Address } from 'lib';
import { useCallback, useState } from 'react';
import {
  RootNavigation,
  toNavigationStateRoutes,
  useRootNavigation,
} from '~/navigation/useRootNavigation';
import { showInfo } from '~/provider/SnackbarProvider';
import { ProposalId } from '~/queries/proposal';
import { OnExecute } from '~/screens/transaction/TransactionProvider';
import { ProposalDef, ProposeResponse, useApiPropose } from './usePropose.api';

export type OnPropose = (
  proposal: ProposeResponse,
  navigation: RootNavigation,
) => Promise<void> | void;

export const usePropose = () => {
  const navigation = useRootNavigation();
  const apiPropose = useApiPropose();

  const [proposing, setProposing] = useState(false);

  const propose = useCallback(
    async (account: Address, tx: ProposalDef, onPropose?: OnPropose) => {
      setProposing(true);

      const proposal = await apiPropose(tx, account);

      await onPropose?.(proposal, navigation);
      setProposing(false);

      return proposal;
    },
    [navigation, apiPropose],
  );

  return [propose, proposing] as const;
};

export const popToProposal = (
  proposal: ProposalId,
  navigation: RootNavigation,
  onExecute?: OnExecute,
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
          name: 'Proposal',
          params: {
            id: proposal,
            onExecute,
          },
        },
      ),
    }),
  );

export const showProposalSnack = (...params: Parameters<typeof popToProposal>) => {
  showInfo('Proposal created', {
    action: {
      label: 'View proposal',
      onPress: () => popToProposal(...params),
    },
    visibilityTime: 8000,
  });
};
