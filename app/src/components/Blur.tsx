import { useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { BlurView, BlurViewProps } from '@react-native-community/blur';
import { StatusBar } from 'expo-status-bar';
import { HideNavigationBar } from './NavigationBar/HideNavigationBar';

export const Blur = ({ children, ...props }: Partial<BlurViewProps>) => (
  <>
    <StatusBar style="light" />
    <HideNavigationBar />
    <BlurView
      blurAmount={16}
      blurType={useTheme().dark ? 'light' : 'dark'}
      style={StyleSheet.absoluteFill}
      {...props}
    />
    {children}
  </>
);
