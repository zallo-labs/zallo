import { ShareIcon } from '~/util/theme/icons';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { AccountId, useAccount } from '@api/account';

export interface ReceiveAppbarProps {
  account: AccountId;
  url: string;
}

export const ReceiveAppbar = ({ account: accountAddr, url }: ReceiveAppbarProps) => {
  const account = useAccount(accountAddr);

  return (
    <Appbar.Header mode="center-aligned">
      <AppbarMenu />

      <Appbar.Content title="Receive" />

      <Appbar.Action
        icon={ShareIcon}
        onPress={() => Share.share({ title: 'Account', url, message: `${account.name}\n${url}` })}
      />
    </Appbar.Header>
  );
};
