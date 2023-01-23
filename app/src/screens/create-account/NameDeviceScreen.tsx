import { useState } from 'react';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { View } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
import { Appbar, Button, Text } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { TextField } from '~/components/fields/TextField';
import { Actions } from '~/components/layout/Actions';
import * as Device from 'expo-device';
import { useUpdateUser } from '~/mutations/user/useUpdateUser.api';
import { useUser } from '~/queries/useUser.api';

export interface NameDeviceScreenParams {
  onContinue: () => void;
}

export type NameDeviceScreenProps = StackNavigatorScreenProps<'NameDevice'>;

export const NameDeviceScreen = ({ route }: NameDeviceScreenProps) => {
  const { onContinue } = route.params;
  const styles = useStyles();
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

const useStyles = makeStyles(({ space, s }) => ({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginHorizontal: space(2),
  },
  text: {
    textAlign: 'center',
    marginVertical: space(4),
  },
  actionButton: {
    margin: s(16),
  },
}));
