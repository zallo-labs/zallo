import { DeleteOutlineIcon, SettingsOutlineIcon } from '~/util/theme/icons';
import { Appbar } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { useDeleteConfirmation } from '../alert/DeleteModalScreen';
import { AppbarExtraContent } from '~/components/Appbar/AppbarExtraContent';
import { CombinedUser } from '~/queries/user/useUser.api';
import { useRemoveUser } from '~/mutations/user/remove/useRemoveUser';
import { ProposableButton } from '~/components/proposable/ProposableButton';
import { makeStyles } from '@theme/makeStyles';
import { Box } from '~/components/layout/Box';
import { UserNameContent } from './UserNameContent';

export interface UserAppbarProps {
  user: CombinedUser;
}

export const UserAppbar = ({ user }: UserAppbarProps) => {
  const styles = useStyles();
  const [remove] = useRemoveUser(user);
  const confirmDelete = useDeleteConfirmation({
    message: 'Are you sure you want to remove this user?',
  });

  return (
    <Box>
      <Appbar.Header style={styles.background}>
        <Appbar.BackAction onPress={useGoBack()} />

        <AppbarExtraContent>
          <ProposableButton proposable={user.configs} />
        </AppbarExtraContent>

        <Appbar.Action
          icon={DeleteOutlineIcon}
          onPress={() => confirmDelete(remove)}
        />
        <Appbar.Action icon={SettingsOutlineIcon} />
      </Appbar.Header>

      <UserNameContent user={user} />
    </Box>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  background: {
    backgroundColor: colors.surfaceVariant,
  },
  onBackground: {
    color: colors.onSurfaceVariant,
  },
}));
