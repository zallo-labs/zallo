import { makeStyles } from '@theme/makeStyles';
import React from 'react';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Box } from './Box';

export interface ActionsProps {
  children?: ReactNode;
  horizontal?: boolean;
}

export const Actions = ({ children, horizontal }: ActionsProps) => {
  const styles = useStyles();

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

const useStyles = makeStyles(({ s }) => ({
  hContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: s(16),
  },
  vContainer: {
    alignItems: 'stretch',
    gap: s(8),
    margin: s(16),
  },
}));
