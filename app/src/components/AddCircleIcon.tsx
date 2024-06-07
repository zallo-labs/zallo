import { AddIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';

export function AddCircleIcon() {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <AddIcon size={ICON_SIZE.small} style={styles.inner} />
    </View>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: colors.primaryContainer,
    borderRadius: corner.full,
  },
  inner: {
    color: colors.onPrimaryContainer,
  },
}));
