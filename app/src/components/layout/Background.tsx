import { Platform, View } from 'react-native';
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
    <View style={styles.background}>
      <StatusBar backgroundColor="transparent" />
      {children}
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  background: {
    display: 'flex',
    flex: 1,
    backgroundColor: colors.background,
  },
}));
