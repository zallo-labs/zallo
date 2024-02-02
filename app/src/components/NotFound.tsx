import { BackIcon } from '@theme/icons';
import { Button } from './Button';
import { Actions } from './layout/Actions';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICON_SIZE } from '@theme/paper';
import { Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';

export interface NotFoundProps {
  name: string;
}

export function NotFound({ name }: NotFoundProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="robot-confused" size={ICON_SIZE.large} style={styles.error} />

        <Text variant="headlineLarge" style={styles.error}>
          {name} not found
        </Text>
      </View>

      <Actions>
        <Link href=".." asChild>
          <Button mode="contained" icon={BackIcon}>
            Back
          </Button>
        </Link>
      </Actions>
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
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
