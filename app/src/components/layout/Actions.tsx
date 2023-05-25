import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export interface ActionsProps {
  children?: ReactNode;
  horizontal?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Actions = ({ children, horizontal, style }: ActionsProps) => (
  <View style={[styles.rootContainer, style]}>
    {horizontal ? (
      <View style={styles.hContainer}>
        {React.Children.count(children) === 1 ? <View /> : null}

        {children}
      </View>
    ) : (
      <View style={styles.vContainer}>{children}</View>
    )}
  </View>
);

const styles = StyleSheet.create({
  rootContainer: {
    // borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  hContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
  },
  vContainer: {
    alignItems: 'stretch',
    gap: 8,
    margin: 16,
  },
});
