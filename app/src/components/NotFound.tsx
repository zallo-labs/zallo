import { BackIcon } from '@theme/icons';
import { Appbar, AppbarProps } from './Appbar/Appbar';
import { Button } from './Button';
import { Actions } from './layout/Actions';
import { Screen } from './layout/Screen';
import { View } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICON_SIZE } from '@theme/paper';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export interface NotFoundProps {
  name: string;
  appbarProps?: Partial<AppbarProps>;
}

export function NotFound({ name, appbarProps }: NotFoundProps) {
  const styles = useStyles();
  const { goBack } = useNavigation();

  return (
    <Screen>
      <Appbar mode="small" leading="back" headline="" {...appbarProps} />

      <View style={styles.container}>
        <MaterialCommunityIcons name="robot-confused" size={ICON_SIZE.large} style={styles.error} />

        <Text variant="headlineLarge" style={styles.error}>
          {name} not found
        </Text>
      </View>

      <Actions>
        <Button mode="contained" icon={BackIcon} onPress={goBack}>
          Back
        </Button>
      </Actions>
    </Screen>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  error: {
    color: colors.error,
  },
}));
