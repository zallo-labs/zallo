import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@util/theme/paper';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { WalletPaymentCard, WalletPaymentCardProps } from './WalletPaymentCard';
import { useSelectedWallet } from './useSelectedWallet';

export interface SelectedWalletCardProps
  extends Omit<WalletPaymentCardProps, 'wallet'> {}

export const SelectedWalletCard = (props: SelectedWalletCardProps) => {
  const { colors } = useTheme();
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();
  const selected = useSelectedWallet();

  return (
    <WalletPaymentCard
      {...props}
      wallet={selected}
      backgroundColor={colors.tertiaryContainer}
      onPress={() => navigate('SelectWallet')}
    />
  );
};
