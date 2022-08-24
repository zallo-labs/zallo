import { CommonActions } from '@react-navigation/native';
import { address, TxDef } from 'lib';
import { useCallback } from 'react';
import {
  toNavigationStateRoutes,
  useRootNavigation,
} from '~/navigation/useRootNavigation';
import { TxId } from '~/queries/tx';
import { WalletId } from '~/queries/wallets';
import { useApiProposeTx } from './useProposeTx.api';

export const useProposeTx = (wallet: WalletId) => {
  const navigation = useRootNavigation();
  const propose = useApiProposeTx();

  return useCallback(
    async (txDef: TxDef, onPropose?: (tx: TxId) => void) => {
      // Transaction must be attached to an active wallet
      const tx = (await propose(txDef, wallet)).data!.proposeTx;
      const id: TxId = { account: address(tx.accountId), hash: tx.hash };

      onPropose?.(id);

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
    },
    [navigation, propose, wallet],
  );
};
