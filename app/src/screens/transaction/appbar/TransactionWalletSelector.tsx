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
import { useWallet } from '~/queries/wallet/useWallet';
import { assert } from 'console';

export interface TransactionWalletSelectorProps {
  tx: Tx;
  textStyle?: StyleProp<TextStyle>;
  iconColor?: string;
}

export const TransactionWalletSelector = ({
  tx,
  textStyle,
  iconColor,
}: TransactionWalletSelectorProps) => {
  const navigation = useRootNavigation();
  const wallet = useWallet(tx.wallet);
  const setWallet = useApiSetTxWallet(tx);

  const canSelect = tx.status === 'proposed';
  const selectWallet = useCallback(
    (account: Address) => {
      assert(canSelect);

      navigation.navigate('Account', {
        id: account,
        onSelectWallet: (wallet) => {
          setWallet(wallet);
          navigation.goBack();
        },
        showInactiveWallets: false,
        title: 'Select executing wallet',
      });
    },
    [canSelect, navigation, setWallet],
  );

  // Select another wallet from the same account if it's inactive
  // A timeout is required as navigation fails if it occurs too quickly upon mount - https://github.com/react-navigation/react-navigation/issues/9182
  useFocusEffect(
    useCallback(() => {
      if (canSelect) {
        const timer = setTimeout(() => {
          if (wallet && wallet.state.status !== 'active')
            selectWallet(wallet.accountAddr);
        });

        return () => clearTimeout(timer);
      }
    }, [canSelect, selectWallet, wallet]),
  );

  if (!wallet) return <Suspend />;

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
          {wallet.name}
        </Text>
        <Text variant="bodySmall" style={textStyle}>
          <Addr addr={wallet.accountAddr} />
        </Text>
      </Box>

      <Box>
        {canSelect && (
          <IconButton
            icon={ChevronRight}
            iconColor={iconColor}
            onPress={() => selectWallet(wallet.accountAddr)}
          />
        )}
      </Box>
    </Box>
  );
};
