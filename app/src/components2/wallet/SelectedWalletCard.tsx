import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@util/theme/paper';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { WalletCard, WalletCardProps } from './WalletCard';
import { useSelectedWallet } from './useSelectedWallet';

export interface SelectedWalletCardProps
  extends Omit<WalletCardProps, 'wallet'> {}

export const SelectedWalletCard = (props: SelectedWalletCardProps) => {
  const { colors } = useTheme();
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();
  const selected = useSelectedWallet();

  return (
    <WalletCard
      {...props}
      wallet={selected}
      backgroundColor={colors.tertiaryContainer}
      onPress={() => navigate('SelectWallet')}
    />
  );
};
