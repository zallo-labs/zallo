import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { CombinedAccount } from '~/queries/account/useAccount.api';

export type AccountsScreenParams = {
  onSelect?: (account: CombinedAccount) => void;
};

export type AccountsScreenProps = RootNavigatorScreenProps<'Accounts'>;

export const AccountsScreen = ({ route }: AccountsScreenProps) => {
  return null;
};
