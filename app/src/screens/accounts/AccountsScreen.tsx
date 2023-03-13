import { WAccount } from '@api/account';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export type AccountsScreenParams = {
  onSelect?: (account: WAccount) => void;
};

export type AccountsScreenProps = StackNavigatorScreenProps<'Accounts'>;

export const AccountsScreen = ({ route }: AccountsScreenProps) => {
  return null;
};
