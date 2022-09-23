import { DeleteOutlineIcon, SearchIcon } from '~/util/theme/icons';
import { Appbar } from 'react-native-paper';
import { useDeleteConfirmation } from '../alert/DeleteModalScreen';
import { CombinedUser } from '~/queries/user/useUser.api';
import { useRemoveUser } from '~/mutations/user/remove/useRemoveUser';
import { FC } from 'react';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { useAccount } from '~/queries/account/useAccount.api';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export interface UserAppbarProps {
  user: CombinedUser;
  AppbarHeader: FC<AppbarHeaderProps>;
}

export const UserAppbar = ({ user, AppbarHeader }: UserAppbarProps) => {
  const { navigate } = useRootNavigation();
  const [account] = useAccount(user);
  const [remove] = useRemoveUser(user);
  const confirmDelete = useDeleteConfirmation({
    message: 'Are you sure you want to remove this user?',
  });

  return (
    <AppbarHeader>
      <AppbarBack />

      <Appbar.Content title={account.name} />

      <Appbar.Action
        icon={SearchIcon}
        onPress={() => navigate('Account', { id: user.account })}
      />
      <Appbar.Action
        icon={DeleteOutlineIcon}
        onPress={() => confirmDelete(remove)}
      />
    </AppbarHeader>
  );
};
