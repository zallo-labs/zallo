import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { BlurViewProps } from '@react-native-community/blur';
import { makeStyles } from '@theme/makeStyles';

const BACKGROUND_COLOR = {
  light: 'rgba(255,255,255,0.5)',
  dark: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',
};

export interface BlurProps extends Omit<BlurViewProps, 'blurType'> {
  blurType?: 'dark' | 'light';
}

export const Blur = ({ children, ...props }: Partial<BlurProps>) => {
  const styles = useStyles({ blurType: useTheme().dark ? 'light' : 'dark', ...props });

  return (
    <>
      <View style={[StyleSheet.absoluteFill, styles.blur]} {...props} />
      {children}
    </>
  );
};

const useStyles = makeStyles((_, { blurType, blurAmount = 5 }: BlurProps) => ({
  blur: {
    backdropFilter: `blur(${blurAmount}px)`,
    backgroundColor: BACKGROUND_COLOR[blurType ?? 'transparent'],
  },
}));
