import { AccountIcon } from '@theme/icons';
import { Drawer } from 'react-native-paper';
import { AccountId, useAccount } from '@api/account';
import { useRootNavigation } from '../useRootNavigation';

export interface AccountDrawerItemProps {
  account: AccountId;
}

export const AccountDrawerItem = ({ account: accountAddr }: AccountDrawerItemProps) => {
  const account = useAccount(accountAddr);
  const { navigate } = useRootNavigation();

  return (
    <Drawer.Item
      label={account.name}
      icon={AccountIcon}
      onPress={() => navigate('Account', { account: accountAddr })}
    />
  );
};
