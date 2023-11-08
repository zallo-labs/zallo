import { Platform, View } from 'react-native';
import { ReactNode, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as AndroidNav from 'expo-navigation-bar';
import { createStyles, useStyles } from '@theme/styles';

export interface BackgroundProps {
  children: ReactNode;
}

export const Background = ({ children }: BackgroundProps) => {
  const { styles } = useStyles(stylesheet);

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

const stylesheet = createStyles(({ colors }) => ({
  background: {
    display: 'flex',
    flex: 1,
    backgroundColor: colors.background,
  },
}));
