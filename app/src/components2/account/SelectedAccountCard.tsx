import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@util/theme/paper';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';
import { AccountCard, AccountCardProps } from './AccountCard';
import { useSelectedAccount } from './useSelectedAccount';

export interface SelectedAccountCardProps
  extends Omit<AccountCardProps, 'account'> {}

export const SelectedAccountCard = (props: SelectedAccountCardProps) => {
  const { colors } = useTheme();
  const { navigate } = useNavigation<BottomNavigatorProps['navigation']>();
  const selected = useSelectedAccount();

  return (
    <AccountCard
      {...props}
      account={selected}
      backgroundColor={colors.tertiaryContainer}
      onPress={() => navigate('SelectAccount')}
    />
  );
};
