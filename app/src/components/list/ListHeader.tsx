import { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { makeStyles } from '@theme/makeStyles';
import { TextProps } from '@theme/types';

export interface ListHeaderProps extends TextProps {
  trailing?: string | ReactNode;
}

export const ListHeader = ({ style, trailing: Trailing, ...props }: ListHeaderProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={styles.header} {...props} />
      {typeof Trailing === 'function' ? (
        <Trailing />
      ) : (
        <Text style={styles.trailingText}>{Trailing}</Text>
      )}
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  header: {
    flex: 1,
  },
  trailingText: {
    color: colors.onSurfaceVariant,
  },
}));
