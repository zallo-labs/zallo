import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { Suspend } from '~/components/Suspender';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight } from '~/util/theme/icons';
import { Address } from 'lib';
import { useCallback } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useApiSetTxWallet } from '~/mutations/tx/useSetTxWallet.api';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Tx } from '~/queries/tx';
import { assert } from 'console';
import { useIsDeployed } from '@network/useIsDeployed';
import { CombinedWallet } from '~/queries/wallets';

export interface TransactionWalletSelectorProps {
  tx: Tx;
  executingWallet: CombinedWallet;
  textStyle?: StyleProp<TextStyle>;
  iconColor?: string;
}

export const TransactionWalletSelector = ({
  tx,
  executingWallet,
  textStyle,
  iconColor,
}: TransactionWalletSelectorProps) => {
  const navigation = useRootNavigation();
  const setWallet = useApiSetTxWallet(tx);
  const accountIsDeployed = useIsDeployed(tx.account);

  const canSelect = tx.status === 'proposed';
  const selectWallet = useCallback(
    (account: Address) => {
      assert(canSelect);

      navigation.navigate('Account', {
        id: account,
        title: 'Select executing wallet',
        inactiveOpacity: true,
        onSelectWallet: (wallet) => {
          setWallet(wallet);
          navigation.goBack();
        },
      });
    },
    [canSelect, navigation, setWallet],
  );

  // Select another wallet from the same account if it's inactive
  // A timeout is required as navigation fails if it occurs too quickly upon mount - https://github.com/react-navigation/react-navigation/issues/9182
  // useFocusEffect(
  //   useCallback(() => {
  //     if (canSelect) {
  //       const timer = setTimeout(() => {
  //         if (wallet && wallet.state.status !== 'active' && accountIsDeployed)
  //           selectWallet(wallet.accountAddr);
  //       });

  //       return () => clearTimeout(timer);
  //     }
  //   }, [accountIsDeployed, canSelect, selectWallet, wallet]),
  // );

  return (
    <Box
      horizontal
      justifyContent="space-between"
      alignItems="center"
      mx={3}
      mb={2}
    >
      <Box vertical justifyContent="space-around">
        <Text variant="titleMedium" style={textStyle}>
          {executingWallet.name}
        </Text>
        <Text variant="bodySmall" style={textStyle}>
          <Addr addr={executingWallet.accountAddr} />
        </Text>
      </Box>

      <Box>
        {canSelect && (
          <IconButton
            icon={ChevronRight}
            iconColor={iconColor}
            onPress={() => selectWallet(executingWallet.accountAddr)}
          />
        )}
      </Box>
    </Box>
  );
};
