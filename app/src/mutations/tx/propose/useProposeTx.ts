import { CommonActions } from '@react-navigation/native';
import { address, TxDef } from 'lib';
import { useCallback } from 'react';
import {
  toNavigationStateRoutes,
  useRootNavigation,
} from '~/navigation/useRootNavigation';
import { ProposedTx, TxId } from '~/queries/tx';
import { CombinedWallet } from '~/queries/wallets';
import { useApiProposeTx } from './useProposeTx.api';

export const useProposeTx = (wallet: CombinedWallet) => {
  const navigation = useRootNavigation();
  const propose = useApiProposeTx(wallet);

  return useCallback(
    async (txDef: TxDef, onPropose?: (tx: ProposedTx) => void) => {
      const tx = (await propose(txDef)).data!.proposeTx;
      const id: TxId = { account: address(tx.accountId), hash: tx.hash };

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
              params: { id, onPropose },
            },
          ),
        }),
      );
    },
    [navigation, propose],
  );
};
