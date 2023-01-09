import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { CombinedAccount } from '~/queries/account/useAccount.api';

export type AccountsScreenParams = {
  onSelect?: (account: CombinedAccount) => void;
};

export type AccountsScreenProps = StackNavigatorScreenProps<'Accounts'>;

export const AccountsScreen = ({ route }: AccountsScreenProps) => {
  return null;
};
