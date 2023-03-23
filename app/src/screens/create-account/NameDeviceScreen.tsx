import { useState } from 'react';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { TextField } from '~/components/fields/TextField';
import * as Device from 'expo-device';
import { useUser, useUpdateUser } from '@api/user';
import { StyleSheet } from 'react-native';

export interface NameDeviceScreenParams {
  onContinue: () => void;
}

export type NameDeviceScreenProps = StackNavigatorScreenProps<'NameDevice'>;

export const NameDeviceScreen = ({ route }: NameDeviceScreenProps) => {
  const { onContinue } = route.params;
  const updateUser = useUpdateUser();

  const [name, setName] = useState(useUser().name || Device.deviceName || '');

  return (
    <View style={styles.root}>
      <Appbar.Header>
        <AppbarBack />
      </Appbar.Header>

      <View style={styles.container}>
        <Text variant="headlineLarge" style={styles.text}>
          What should we name this device?
        </Text>

        <TextField
          label="Device name"
          value={name}
          onChangeText={setName}
          error={!name && 'Required'}
          autoFocus
        />
      </View>

      <Button
        mode="contained"
        style={styles.actionButton}
        onPress={async () => {
          await updateUser({ name });
          onContinue();
        }}
      >
        Continue
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: 16,
  },
  text: {
    textAlign: 'center',
    marginVertical: 16,
  },
  actionButton: {
    margin: 16,
  },
});
