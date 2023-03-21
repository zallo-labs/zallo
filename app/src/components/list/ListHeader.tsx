import { TextProps } from '@theme/types';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface ListHeaderProps extends TextProps {
  trailing?: ReactNode;
}

export const ListHeader = ({ style, trailing, ...props }: ListHeaderProps) => (
  <View style={styles.container}>
    <Text variant="bodyMedium" style={styles.header} {...props} />
    {trailing}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginHorizontal: 16,
  },
  header: {
    flex: 1,
  },
});
