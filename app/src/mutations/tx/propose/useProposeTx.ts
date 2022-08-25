import { CommonActions } from '@react-navigation/native';
import { address, TxDef } from 'lib';
import { useCallback, useState } from 'react';
import {
  toNavigationStateRoutes,
  useRootNavigation,
} from '~/navigation/useRootNavigation';
import { TxId } from '~/queries/tx';
import { WalletId } from '~/queries/wallets';
import { useApiProposeTx } from './useProposeTx.api';

type Propose = (
  txDef: TxDef,
  onPropose?: (tx: TxId) => Promise<void> | void,
) => Promise<void>;

export const useProposeTx = (wallet: WalletId): [Propose, boolean] => {
  const navigation = useRootNavigation();
  const apiPropose = useApiProposeTx();

  const [proposing, setProposing] = useState(false);

  const propose: Propose = useCallback(
    async (txDef, onPropose) => {
      setProposing(true);

      // Transaction must be attached to an active wallet
      const tx = (await apiPropose(txDef, wallet)).data!.proposeTx;
      const id: TxId = { account: address(tx.accountId), hash: tx.hash };

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
    [navigation, apiPropose, wallet],
  );

  return [propose, proposing];
};
