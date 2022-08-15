import { useNavigation } from '@react-navigation/native';
import { address, TxDef } from 'lib';
import { useCallback } from 'react';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { ProposedTx, TxId } from '~/queries/tx';
import { CombinedWallet } from '~/queries/wallets';
import { useProposeApiTx } from './useProposeApiTx.api';

export const useProposeTx = (wallet: CombinedWallet) => {
  const navigation = useNavigation<BottomNavigatorProps['navigation']>();
  const propose = useProposeApiTx(wallet.accountAddr);

  return useCallback(
    async (txDef: TxDef, onPropose?: (tx: ProposedTx) => void) => {
      const tx = (await propose(txDef)).data!.proposeTx;
      const id: TxId = { account: address(tx.accountId), hash: tx.hash };

      navigation.navigate('Transaction', { id, onPropose });
    },
    [navigation, propose],
  );
};
