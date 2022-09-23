import { makeStyles } from '@theme/makeStyles';
import { useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { EditableContent } from '~/components/EditableContent';
import { TextField } from '~/components/fields/TextField';
import { useSetUserName } from '~/mutations/user/useSetUserName.api';
import { CombinedUser } from '~/queries/user/useUser.api';

export interface EditableUserNameProps {
  user: CombinedUser;
  style?: StyleProp<ViewStyle>;
}

export const EditableUserName = ({ user, style }: EditableUserNameProps) => {
  const styles = useStyles();
  const setUserName = useSetUserName(user);

  const [input, setInput] = useState(user.name);

  return (
    <EditableContent
      content={
        <Text variant="headlineSmall" numberOfLines={1} style={styles.name}>
          {user.name}
        </Text>
      }
      editContent={
        <TextField
          label="User Name"
          value={input}
          onChangeText={setInput}
          style={styles.field}
          autoFocus
          error={(value) => !value && 'Required'}
        />
      }
      onSubmit={input ? () => setUserName(input) : undefined}
      onCancel={() => setInput(user.name)}
      containerStyle={style}
    />
  );
};

const useStyles = makeStyles(({ colors }) => ({
  name: {
    alignSelf: 'center',
  },
  field: {
    backgroundColor: colors.surface,
  },
}));
