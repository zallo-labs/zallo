import { UndoIcon } from '@theme/icons';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { Appbar } from '~/components/Appbar/Appbar';
import { TextField } from '~/components/fields/TextField';
import { Box } from '~/components/layout/Box';
import { AccountId, useUpdateAccount } from '@api/account';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useAccount } from '@api/account';
import { StyleSheet } from 'react-native';

export interface RenameAccountScreenParams {
  account: AccountId;
}

export type RenameAccountScreenProps = StackNavigatorScreenProps<'RenameAccount'>;

export const RenameAccountScreen = ({ route: { params } }: RenameAccountScreenProps) => {
  const account = useAccount(params.account);
  const update = useUpdateAccount(account);

  const [name, setName] = useState(account.name);
  const submit = () => update({ name });

  return (
    <Box>
      <Appbar
        mode="large"
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

const styles = StyleSheet.create({
  fieldsContainer: {
    marginHorizontal: 16,
  },
});
