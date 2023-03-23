import React from 'react';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Box } from './Box';

export interface ActionsProps {
  children?: ReactNode;
  horizontal?: boolean;
}

export const Actions = ({ children, horizontal }: ActionsProps) => {
  return (
    <>
      <Box flex={1} />

      {horizontal ? (
        <Box style={styles.hContainer}>
          {React.Children.count(children) === 1 ? <View /> : null}

          {children}
        </Box>
      ) : (
        <Box style={styles.vContainer}>{children}</Box>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
