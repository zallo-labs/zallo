import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TabScreenSkeleton } from '~/components/tab/TabScreenSkeleton';
import { TabNavigatorScreenProp } from '.';

export type CollectablesTabProps = TabNavigatorScreenProp<'Collectables'>;

export const CollectablesTab = withSuspense(
  () => (
    <Text variant="bodyLarge" style={styles.text}>
      Coming soon!
    </Text>
  ),
  TabScreenSkeleton,
);

const styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
    margin: 16,
  },
});
