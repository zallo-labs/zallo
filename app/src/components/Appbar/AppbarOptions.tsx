import { useNavigation } from 'expo-router';
import { AppbarProps } from './Appbar';
import { useLayoutEffect } from 'react';

/* Derrived from expo-router/src/views/Screen.tsx */

export interface AppbarOptionsProps extends AppbarProps {}

export function AppbarOptions(options: AppbarOptionsProps) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ appbar: options });
  }, [navigation.setOptions, options]);

  return null;
}
