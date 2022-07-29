import { ComponentPropsWithoutRef } from 'react';
import { StyleSheet } from 'react-native';
import { FAB as Base } from 'react-native-paper';

export type FABProps = ComponentPropsWithoutRef<typeof Base>;

export const FAB = (props: FABProps) => (
  <Base {...props} style={[styles.fab, props.style]} />
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 32,
    right: 0,
    bottom: 0,
  },
});
