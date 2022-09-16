import { CommonActions } from '@react-navigation/native';
import { Address, TxDef } from 'lib';
import { useCallback, useState } from 'react';
import {
  toNavigationStateRoutes,
  useRootNavigation,
} from '~/navigation/useRootNavigation';
import { ProposalId } from '~/queries/proposal';
import { useApiPropose } from './usePropose.api';

export const usePropose = () => {
  const navigation = useRootNavigation();
  const apiPropose = useApiPropose();

  const [proposing, setProposing] = useState(false);

  const propose = useCallback(
    async (
      account: Address,
      txDef: TxDef,
      onPropose?: (tx: ProposalId) => Promise<void> | void,
    ) => {
      setProposing(true);

      const proposal = await apiPropose(txDef, account);
      const id: ProposalId = { account, hash: proposal.hash };

      await onPropose?.(id);

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
              params: { id },
            },
          ),
        }),
      );

      setProposing(false);
    },
    [navigation, apiPropose],
  );

  return [propose, proposing] as const;
};
