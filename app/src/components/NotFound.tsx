import { BackIcon } from '@theme/icons';
import { Appbar } from './Appbar/Appbar';
import { Button } from './Button';
import { Actions } from './layout/Actions';
import { Screen } from './layout/Screen';
import { View } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICON_SIZE } from '@theme/paper';
import { Text } from 'react-native-paper';

export interface NotFoundProps {
  name: string;
}

export function NotFound({ name }: NotFoundProps) {
  const styles = useStyles();

  return (
    <Screen>
      <Appbar mode="small" leading="back" headline="" />

      <View style={styles.container}>
        <MaterialCommunityIcons name="robot-confused" size={ICON_SIZE.large} style={styles.error} />

        <Text variant="headlineLarge" style={styles.error}>
          {name} not found
        </Text>
      </View>

      <Actions>
        <Button mode="contained" icon={BackIcon}>
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
