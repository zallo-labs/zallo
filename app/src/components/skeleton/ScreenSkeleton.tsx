import { StyleSheet, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

export function ScreenSkeleton() {
  return (
    <View style={styles.root}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
