import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { BlurViewProps } from '@react-native-community/blur';
import { createStyles } from '@theme/styles';
import { useMemoApply } from '~/hooks/useMemoized';

const BACKGROUND_COLOR = {
  light: 'rgba(255,255,255,0.5)',
  dark: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',
};

export interface BlurProps extends Omit<BlurViewProps, 'blurType'> {
  blurType?: 'dark' | 'light';
}

export const Blur = ({ children, ...props }: Partial<BlurProps>) => {
  const styles = useMemoApply(getStyles, {
    blurType: useTheme().dark ? 'light' : 'dark',
    ...props,
  });

  return (
    <>
      <View style={[StyleSheet.absoluteFill, styles.blur]} {...props} />
      {children}
    </>
  );
};

const getStyles = ({ blurType, blurAmount = 16 }: BlurProps) =>
  createStyles({
    blur: {
      backdropFilter: `blur(${blurAmount}px)`,
      backgroundColor: BACKGROUND_COLOR[blurType ?? 'transparent'],
    },
  });
