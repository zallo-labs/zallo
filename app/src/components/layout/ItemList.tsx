import { CORNER } from '@theme/paper';
import { createStyles } from '@theme/styles';
import { View, ViewProps } from 'react-native';

export interface ItemListProps extends ViewProps {}

export function ItemList(props: ItemListProps) {
  return <View {...props} style={[styles.list, props.style]} />;
}

const styles = createStyles({
  list: {
    overflow: 'hidden',
    gap: 2,
    borderRadius: CORNER.l,
  },
});
