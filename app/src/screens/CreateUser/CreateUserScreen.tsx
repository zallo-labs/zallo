import { View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet } from 'react-native';
import { Screen } from '~/components/layout/Screen';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { TextField } from '~/components/fields/TextField';
import { useUpdateUser, useUser } from '@api/user';
import { useState } from 'react';
import { RequireBiometricsItem } from '~/components2/items/RequireBiometricsItem';

export type CreateUserScreenProps = StackNavigatorScreenProps<'CreateUser'>;

export const CreateUserScreen = ({ navigation: { navigate } }: CreateUserScreenProps) => {
  const updateUser = useUpdateUser();

  const [name, setName] = useState(useUser().name);

  return (
    <Screen>
      <AppbarLarge leading="back" headline="Create User" />

      <View style={styles.fields}>
        <TextField
          label="Name"
          supporting="Only visible by account members"
          containerStyle={styles.inset}
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <RequireBiometricsItem />
      </View>

      <Actions>
        <Button mode="contained" style={styles.button}>
          Create user
        </Button>
      </Actions>
    </Screen>
  );
};

const styles = StyleSheet.create({
  fields: {
    marginVertical: 16,
    gap: 16,
  },
  inset: {
    marginHorizontal: 16,
  },
  button: {
    alignSelf: 'stretch',
  },
});
