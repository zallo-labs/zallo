import { Platform, StyleSheet, View } from 'react-native';
import { ReactNode, useEffect } from 'react';
import { makeStyles } from '@theme/makeStyles';
import { StatusBar } from 'expo-status-bar';
import * as AndroidNav from 'expo-navigation-bar';

export interface BackgroundProps {
  children: ReactNode;
}

export const Background = ({ children }: BackgroundProps) => {
  const styles = useStyles();

  useEffect(() => {
    if (Platform.OS === 'android') {
      AndroidNav.setBackgroundColorAsync('transparent');
      AndroidNav.setPositionAsync('absolute');
    }
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, styles.background]}>
      <>
        <StatusBar backgroundColor="transparent" />
        {children}
      </>
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  background: {
    display: 'flex',
    backgroundColor: colors.background,
  },
}));
