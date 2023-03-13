import { UndoIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { TextField } from '~/components/fields/TextField';
import { Box } from '~/components/layout/Box';
import { AccountId, useUpdateAccount } from '@api/account';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useAccount } from '@api/account';

export interface RenameAccountScreenParams {
  account: AccountId;
}

export type RenameAccountScreenProps = StackNavigatorScreenProps<'RenameAccount'>;

export const RenameAccountScreen = ({ route: { params } }: RenameAccountScreenProps) => {
  const styles = useStyles();
  const account = useAccount(params.account);
  const update = useUpdateAccount(account);

  const [name, setName] = useState(account.name);
  const submit = () => update({ name });

  return (
    <Box>
      <AppbarLarge
        leading={(props) => (
          <AppbarBack2
            {...props}
            onPress={(goBack) => {
              submit();
              goBack();
            }}
          />
        )}
        headline="Rename Account"
      />

      <Box style={styles.fieldsContainer}>
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          onBlur={submit}
          {...(name !== account.name && {
            right: <TextInput.Icon icon={UndoIcon} onPress={() => setName(account.name)} />,
          })}
        />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles(({ s }) => ({
  fieldsContainer: {
    marginHorizontal: s(16),
  },
}));
