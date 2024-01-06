import { StyleSheet } from 'react-native';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from 'react-native-paper';

export const Blur = ({ children, ...props }: Partial<BlurViewProps>) => (
  <>
    <StatusBar style="light" />
    <BlurView
      blurAmount={16}
      blurType={useTheme().dark ? 'light' : 'dark'}
      style={StyleSheet.absoluteFill}
      {...props}
    />
    {children}
  </>
);
