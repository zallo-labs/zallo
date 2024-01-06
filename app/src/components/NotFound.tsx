import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';

import { BackIcon } from '~/util/theme/icons';
import { ICON_SIZE } from '~/util/theme/paper';
import { createStyles, useStyles } from '~/util/theme/styles';
import { Button } from './Button';
import { Actions } from './layout/Actions';

export interface NotFoundProps {
  name: string;
}

export function NotFound({ name }: NotFoundProps) {
  const { styles } = useStyles(stylesheet);
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
