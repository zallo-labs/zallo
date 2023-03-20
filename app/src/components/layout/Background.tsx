import { View } from 'react-native';
import { ReactNode } from 'react';
import { makeStyles } from '@theme/makeStyles';

export interface BackgroundProps {
  children: ReactNode;
}

export const Background = ({ children }: BackgroundProps) => {
  const styles = useStyles();

  return <View style={styles.background}>{children}</View>;
};

const useStyles = makeStyles(({ colors }) => ({
  background: {
    width: '100%',
    height: '100%',
    display: 'flex',
    backgroundColor: colors.background,
  },
}));
