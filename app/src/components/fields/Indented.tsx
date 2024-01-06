import { FC, ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { ICON_SIZE } from '~/util/theme/paper';

export interface IndentedProps {
  children: ReactNode;
  leading?: FC<{ size?: number }>;
  style?: StyleProp<ViewStyle>;
}

export function Indented({ children, leading: Leading, style }: IndentedProps) {
  return (
    <View style={[styles.container, style]}>
      {Leading ? <Leading size={styles.leading.width} /> : <View style={styles.leading} />}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leading: {
    width: ICON_SIZE.small,
  },
});
