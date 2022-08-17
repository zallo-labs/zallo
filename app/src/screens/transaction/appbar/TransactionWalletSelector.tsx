import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { Suspend } from '@components/Suspender';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from '@util/theme/icons';
import { StyleProp, TextStyle } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useApiSetTxWallet } from '~/mutations/tx/useSetTxWallet.api';
import { Tx } from '~/queries/tx';
import { useWallet } from '~/queries/wallets/useWallet';
import { TransactionScreenProps } from '../TransactionScreen';

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
  const navigation = useNavigation<TransactionScreenProps['navigation']>();
  const wallet = useWallet(tx.wallet);
  const setWallet = useApiSetTxWallet(tx);

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

      <IconButton
        icon={ChevronRight}
        iconColor={iconColor}
        onPress={() => {
          navigation.navigate('Account', {
            id: wallet.accountAddr,
            onSelectWallet: (wallet) => {
              setWallet(wallet);
              navigation.goBack();
            },
          });
        }}
      />
    </Box>
  );
};
