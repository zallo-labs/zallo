import { View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { ProgressBar } from 'react-native-paper';

interface OnboardHeaderProps {
  progress: number;
}

export function OnboardProgress({ progress }: OnboardHeaderProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <ProgressBar animatedValue={progress} />
    </View>
  );
}

const stylesheet = createStyles(({ colors }, { insets }) => ({
  container: {
    paddingTop: 8 + insets.top,
  },
  bar: {
    backgroundColor: colors.surface,
  },
  fill: {
    color: colors.primary,
  },
}));
