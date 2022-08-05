import { StyleSheet } from 'react-native';
import { FAB as Base } from 'react-native-paper';
import { FABProps } from '../FAB';

export type AppbarFABProps = FABProps;

export const AppbarFAB = (props: AppbarFABProps) => (
  <Base {...props} size="small" mode="flat" style={[styles.fab, props.style]} />
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
