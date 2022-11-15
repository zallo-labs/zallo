import { useState } from 'react';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { useSetDeviceName } from '~/mutations/useSetDeviceName.api';
import { View } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
import { Appbar, Button, Text } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { TextField } from '~/components/fields/TextField';
import { Actions } from '~/components/layout/Actions';
import { useDeviceMeta } from '~/queries/useDeviceMeta.api';

export interface NameDeviceScreenParams {
  onContinue: () => void;
}

export type NameDeviceScreenProps = RootNavigatorScreenProps<'NameDevice'>;

export const NameDeviceScreen = ({ route }: NameDeviceScreenProps) => {
  const { onContinue } = route.params;
  const styles = useStyles();
  const setName = useSetDeviceName();

  const [value, setValue] = useState(useDeviceMeta().name);

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
          value={value}
          onChangeText={setValue}
          error={!value && 'Required'}
        />
      </View>

      <Actions
        primary={
          <Button
            mode="contained"
            onPress={() => {
              setName(value);
              onContinue();
            }}
          >
            Continue
          </Button>
        }
      />
    </View>
  );
};

const useStyles = makeStyles(({ space }) => ({
  root: {
    flex: 1,
  },
  container: {
    marginHorizontal: space(2),
  },
  text: {
    textAlign: 'center',
    marginVertical: space(4),
  },
}));
