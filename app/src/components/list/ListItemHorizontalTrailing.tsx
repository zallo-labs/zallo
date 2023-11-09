import { StyleSheet, View, ViewProps } from 'react-native';

export interface ListItemHorizontalTrailingProps extends ViewProps {}

export function ListItemHorizontalTrailing(props: ListItemHorizontalTrailingProps) {
  return <View {...props} style={[styles.container, props.style]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
