import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';

import { AppbarProps } from './Appbar';

/* Derrived from expo-router/src/views/Screen.tsx */

export interface AppbarOptionsProps extends AppbarProps {}

export function AppbarOptions(options: AppbarOptionsProps) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ appbar: options });
  }, [navigation, options]);

  return null;
}
