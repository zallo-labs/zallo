import { createStyles } from '@theme/styles';
import { RectSkeleton } from './RectSkeleton';
import { View } from 'react-native';

export function PaneSkeleton() {
  return (
    <View style={styles.container}>
      <RectSkeleton height="100%" />
    </View>
  );
}

const styles = createStyles({
  container: {
    flex: 1,
    marginVertical: 8,
  },
});
