import { UserConfigsIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { EditableContent } from '~/components/EditableContent';
import { TextField } from '~/components/fields/TextField';
import { Box } from '~/components/layout/Box';
import { useSetUserName } from '~/mutations/user/useSetUserName.api';
import { CombinedUser } from '~/queries/user/useUser.api';
import { useUserScreenContext } from './UserScreenContext';

export interface EditableUserNameProps {
  user: CombinedUser;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export const EditableUserName = ({
  user,
  editing,
  setEditing,
  style,
}: EditableUserNameProps) => {
  const styles = useStyles();
  const setUserName = useSetUserName(user);
  const { sheetShown, setSheetShown } = useUserScreenContext();

  const [input, setInput] = useState(user.name);

  return (
    <EditableContent
      content={
        <Box
          flex={1}
          horizontal
          justifyContent="space-between"
          alignItems="center"
        >
          <Box style={styles.iconButtonPlaceholder} />

          <Text variant="headlineSmall" numberOfLines={1}>
            {user.name}
          </Text>

          <IconButton
            icon={UserConfigsIcon}
            mode="contained"
            disabled={sheetShown}
            onPress={() => setSheetShown(true)}
          />
        </Box>
      }
      editContent={
        <TextField
          label="User Name"
          value={input}
          onChangeText={setInput}
          textStyle={styles.field}
          autoFocus
          error={(value) => !value && 'Required'}
        />
      }
      onSubmit={input ? () => setUserName(input) : undefined}
      onCancel={() => setInput(user.name)}
      editing={editing}
      setEditing={setEditing}
      containerStyle={style}
    />
  );
};

const useStyles = makeStyles(({ colors, iconButton }) => ({
  field: {
    backgroundColor: colors.surface,
  },
  iconButtonPlaceholder: {
    width: iconButton.containerSize,
  },
}));
