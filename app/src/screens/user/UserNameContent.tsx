import { makeStyles } from '@theme/makeStyles';
import { useState } from 'react';
import { Text } from 'react-native-paper';
import { AppbarEditableContent } from '~/components/Appbar/AppbarEditableContent';
import { TextField } from '~/components/fields/TextField';
import { Box } from '~/components/layout/Box';
import { useSetUserName } from '~/mutations/user/useSetUserName.api';
import { useAccount } from '~/queries/account/useAccount.api';
import { CombinedUser } from '~/queries/user/useUser.api';

export interface UserNameContentProps {
  user: CombinedUser;
}

export const UserNameContent = ({ user }: UserNameContentProps) => {
  const styles = useStyles();
  const [account] = useAccount(user.account);
  const setUserName = useSetUserName(user);

  const [input, setInput] = useState(user.name);

  return (
    <AppbarEditableContent
      content={
        <Box vertical alignItems="center">
          <Text variant="headlineSmall" numberOfLines={1}>
            {user.name}
          </Text>
          <Text variant="titleMedium" numberOfLines={1}>
            {account.name}
          </Text>
        </Box>
      }
      editContent={
        <TextField
          label="User Name"
          value={input}
          onChangeText={setInput}
          style={styles.field}
          autoFocus
          autoCapitalize="words"
          error={(value) => !value && 'Required'}
        />
      }
      onSubmit={input ? () => setUserName(input) : undefined}
      onCancel={() => setInput(user.name)}
      containerStyle={styles.background}
    />
  );
};

const useStyles = makeStyles(({ colors }) => ({
  background: {
    backgroundColor: colors.surfaceVariant,
  },
  onBackground: {
    color: colors.onSurfaceVariant,
  },
  field: {
    backgroundColor: colors.surface,
  },
}));
