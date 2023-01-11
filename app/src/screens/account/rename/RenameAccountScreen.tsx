import { UndoIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Address } from 'lib';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { TextField } from '~/components/fields/TextField';
import { Box } from '~/components/layout/Box';
import { useUpdateAccountMetadata } from '~/mutations/account/useUpdateAccountMetadata.api';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useAccount } from '~/queries/account/useAccount.api';

export interface RenameAccountScreenParams {
  account: Address;
}

export type RenameAccountScreenProps = StackNavigatorScreenProps<'RenameAccount'>;

export const RenameAccountScreen = ({ route: { params } }: RenameAccountScreenProps) => {
  const styles = useStyles();
  const account = useAccount(params.account);
  const update = useUpdateAccountMetadata(account);

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
        headline="Rename quorum"
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
