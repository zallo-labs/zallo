import { ActivityIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export function NoActivity() {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <ActivityIcon size={ICON_SIZE.extraLarge} color={styles.icon.color} />
      <Text variant="headlineSmall" style={styles.text}>
        No activity yet
      </Text>
      <Text variant="bodyLarge" style={styles.text}>
        Transactions, messages and transfers will appear here
      </Text>
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    margin: 16,
  },
  icon: {
    color: colors.onSurfaceVariant,
  },
  text: {
    textAlign: 'center',
  },
}));
