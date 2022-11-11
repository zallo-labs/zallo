import { ShareIcon } from '~/util/theme/icons';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarMenu } from '~/components/Appbar/AppbarMenu';
import { Address } from 'lib';
import { useAccount } from '~/queries/account/useAccount.api';

export interface ReceiveAppbarProps {
  account: Address;
  url: string;
}

export const ReceiveAppbar = ({ account: accountAddr, url }: ReceiveAppbarProps) => {
  const [account] = useAccount(accountAddr);

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
