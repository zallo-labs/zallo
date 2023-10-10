import { BackIcon } from '@theme/icons';
import { Button } from './Button';
import { Actions } from './layout/Actions';
import { View } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICON_SIZE } from '@theme/paper';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

export interface NotFoundProps {
  name: string;
}

export function NotFound({ name }: NotFoundProps) {
  const styles = useStyles();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="robot-confused" size={ICON_SIZE.large} style={styles.error} />

        <Text variant="headlineLarge" style={styles.error}>
          {name} not found
        </Text>
      </View>

      <Actions>
        <Button mode="contained" icon={BackIcon} onPress={router.back}>
          Back
        </Button>
      </Actions>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  root: {
    flex: 1,
  },
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
