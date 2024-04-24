import { createStyles } from '@theme/styles';
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function OnboardingLayout() {
  return (
    <View style={styles.root}>
      <View style={styles.pane}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = createStyles({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pane: {
    flex: 1,
    maxWidth: 600,
  },
});
