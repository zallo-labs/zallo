import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { TabNavigatorScreenProp } from '.';

export type CollectablesTabProps = TabNavigatorScreenProp<'Collectables'>;

export const CollectablesTab = () => (
  <Text variant="bodyLarge" style={styles.text}>
    Coming soon!
  </Text>
);

const styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
    margin: 16,
  },
});
