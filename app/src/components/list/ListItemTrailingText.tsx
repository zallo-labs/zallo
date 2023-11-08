import { makeStyles } from '@theme/makeStyles';
import { Text, TextProps } from 'react-native-paper';

export interface ListItemTrailingTextProps extends Omit<TextProps<'labelSmall'>, 'variant'> {}

export function ListItemTrailingText(props: ListItemTrailingTextProps) {
  const styles = useStyles();

  return <Text variant="labelSmall" {...props} style={[styles.text, props.style]} />;
}

const useStyles = makeStyles(({ colors }) => ({
  text: {
    color: colors.onSurfaceVariant,
  },
}));
