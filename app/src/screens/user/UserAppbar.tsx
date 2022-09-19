import { DeleteIcon } from '~/util/theme/icons';
import { FC } from 'react';
import { Appbar } from 'react-native-paper';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { useDeleteConfirmation } from '../alert/DeleteModalScreen';
import { AppbarExtraContent } from '~/components/Appbar/AppbarExtraContent';
import { CombinedUser } from '~/queries/user/useUser.api';
import { useRemoveUser } from '~/mutations/user/remove/useRemoveUser';
import { ProposableButton } from '~/components/proposable/ProposableButton';

export interface UserAppbarProps {
  user: CombinedUser;
  AppbarHeader: FC<AppbarHeaderProps>;
  existing: boolean;
}

export const UserAppbar = ({
  user,
  AppbarHeader,
  existing,
}: UserAppbarProps) => {
  const [remove] = useRemoveUser(user);
  const confirmDelete = useDeleteConfirmation();

  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <AppbarExtraContent>
        <ProposableButton proposable={user.configs} />
      </AppbarExtraContent>

      <Appbar.Content title={existing ? 'Wallet' : 'Create Wallet'} />

      <Appbar.Action icon={DeleteIcon} onPress={() => confirmDelete(remove)} />
    </AppbarHeader>
  );
};
