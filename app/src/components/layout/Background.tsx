import { View } from 'react-native';
import { ReactNode, useEffect } from 'react';
import { makeStyles } from '@theme/makeStyles';
import { StatusBar } from 'expo-status-bar';
import * as Nav from 'expo-navigation-bar';

export interface BackgroundProps {
  children: ReactNode;
}

export const Background = ({ children }: BackgroundProps) => {
  const styles = useStyles();

  useEffect(() => {
    Nav.setBackgroundColorAsync('transparent');
    Nav.setPositionAsync('absolute');
  });

  return (
    <View style={styles.background}>
      <>
        <StatusBar backgroundColor="transparent" />
        {children}
      </>
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  background: {
    width: '100%',
    height: '100%',
    display: 'flex',
    backgroundColor: colors.background,
  },
}));
