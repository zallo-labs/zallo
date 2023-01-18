import { makeStyles } from '@theme/makeStyles';
import { Text, TextProps } from 'react-native-paper';

export interface ListHeaderProps extends TextProps {}

export const ListHeader = (props: ListHeaderProps) => {
  const styles = useStyles();

  return <Text {...props} variant="bodyMedium" style={[styles.header, props.style]} />;
};

const useStyles = makeStyles(({ colors, s }) => ({
  header: {
    color: colors.onSurfaceVariant,
    marginTop: s(16),
    marginBottom: s(4),
    marginHorizontal: s(16),
  },
}));
