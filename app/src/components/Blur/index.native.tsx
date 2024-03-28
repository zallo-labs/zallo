import { useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { StatusBar } from 'expo-status-bar';
import type { BlurProps } from './index';

export function Blur({ children, ...props }: BlurProps) {
  return (
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
}
