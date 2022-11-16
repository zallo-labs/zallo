import { DeleteIcon, EditIcon, PeopleIcon, UndoIcon } from '~/util/theme/icons';
import { Appbar, Menu } from 'react-native-paper';
import { useDeleteConfirmation } from '../alert/DeleteModalScreen';
import { CombinedUser } from '~/queries/user/useUser.api';
import { useRemoveUser } from '~/mutations/user/remove/useRemoveUser';
import { FC } from 'react';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { useAccount } from '~/queries/account/useAccount.api';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { AppbarMore } from '~/components/Appbar/AppbarMore';

export interface UserAppbarProps {
  user: CombinedUser;
  AppbarHeader: FC<AppbarHeaderProps>;
  editName: () => void;
  undo?: () => void;
}

export const UserAppbar = ({ user, AppbarHeader, editName, undo }: UserAppbarProps) => {
  const { navigate } = useRootNavigation();
  const [account] = useAccount(user);
  const [remove] = useRemoveUser(user);
  const confirmRemoval = useDeleteConfirmation({
    message: 'Are you sure you want to remove this user?',
  });

  return (
    <AppbarHeader>
      <AppbarBack />

      <Appbar.Content title={`${account.name} User`} />

      {undo && <Appbar.Action icon={UndoIcon} onPress={undo} />}

      <AppbarMore>
        {({ close }) => (
          <>
            <Menu.Item
              leadingIcon={PeopleIcon}
              title="Account"
              onPress={() => {
                close();
                navigate('Account', { id: user.account });
              }}
            />

            <Menu.Item
              leadingIcon={EditIcon}
              title="Edit name"
              onPress={() => {
                close();
                editName();
              }}
            />

            <Menu.Item
              leadingIcon={DeleteIcon}
              title="Delete user"
              onPress={() => {
                close();
                confirmRemoval(remove);
              }}
            />
          </>
        )}
      </AppbarMore>
    </AppbarHeader>
  );
};
