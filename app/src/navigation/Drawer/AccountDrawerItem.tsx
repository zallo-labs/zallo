import { AccountIcon } from '@theme/icons';
import { Address } from 'lib';
import { Drawer } from 'react-native-paper';
import { useAccount } from '~/queries/account/useAccount.api';
import { useRootNavigation } from '../useRootNavigation';

export interface AccountDrawerItemProps {
  account: Address;
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
