import { buildAddrLink } from '~/util/addrLink';
import { AddIcon, SettingsOutlineIcon, ShareIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { CombinedAccount } from '~/queries/account/useAccount.api';
import { useCreateUser } from '../user/useCreateUser';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export interface AccountAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  title?: string;
  account: CombinedAccount;
}

export const AccountAppbar = ({ AppbarHeader, title, account }: AccountAppbarProps) => {
  const { navigate } = useRootNavigation();
  const createUser = useCreateUser(account.addr);

  return (
    <AppbarHeader mode="large">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title={title || account.name} />

      <Appbar.Action icon={AddIcon} onPress={createUser} />
      <Appbar.Action
        icon={ShareIcon}
        onPress={() => {
          const url = buildAddrLink({ target_address: account.addr });
          Share.share({ url, message: url });
        }}
      />
      <Appbar.Action
        icon={SettingsOutlineIcon}
        onPress={() => navigate('AccountSettings', { account: account.addr })}
      />
    </AppbarHeader>
  );
};
