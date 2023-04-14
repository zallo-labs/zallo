import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

export interface ActionsProps {
  children?: ReactNode;
  horizontal?: boolean;
}

export const Actions = ({ children, horizontal }: ActionsProps) => (
  <View style={styles.rootContainer}>
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
