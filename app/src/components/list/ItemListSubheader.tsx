import { Text, TextProps } from 'react-native-paper';
import { createStyles } from '@theme/styles';

export type ItemListSubheaderProps<T = string> = Omit<TextProps<T>, 'variant'> &
  Partial<Pick<TextProps<T>, 'variant'>>;

export function ItemListSubheader(props: ItemListSubheaderProps) {
  return <Text variant="labelLarge" {...props} style={[styles.text, props.style]} />;
}

const styles = createStyles({
  text: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
});
