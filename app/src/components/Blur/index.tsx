import { useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { BlurViewProps } from '@react-native-community/blur';
import { createStyles, useStyles } from '@theme/styles';

export interface BlurProps extends Partial<Omit<BlurViewProps, 'blurType'>> {
  blurType?: 'dark' | 'light';
}

export const Blur = ({ children, ...props }: BlurProps) => {
  const { styles } = useStyles(stylesheet);

  return (
    <>
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.blur({ blurType: useTheme().dark ? 'light' : 'dark', ...props }),
        ]}
        {...props}
      />
      {children}
    </>
  );
};

const stylesheet = createStyles(({ colors }) => ({
  blur: ({ blurType, blurAmount = 16 }: BlurProps) => ({
    backdropFilter: `blur(${blurAmount}px)`,
    backgroundColor: {
      light: 'rgba(255,255,255,0.5)',
      dark: 'rgba(0,0,0,0.5)',
      transparent: 'transparent',
    }[blurType ?? 'transparent'],
  }),
}));
