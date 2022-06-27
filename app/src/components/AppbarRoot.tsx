import { StatusBar } from 'expo-status-bar';
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Appbar, overlay, useTheme } from 'react-native-paper';

export type AppbarRootProps = ComponentPropsWithoutRef<typeof Appbar> & {
  children: ReactNode;
};

export const AppbarRoot = ({ children, ...props }: AppbarRootProps) => {
  const { colors } = useTheme();

  // elevation = isV3 ? (elevated ? 2 : 0) : 4,  -- https://github.com/callstack/react-native-paper/blob/main/src/components/Appbar/Appbar.tsx
  const color = overlay(4, colors.surface);

  return (
    <>
      <StatusBar backgroundColor={color} style="inverted" />

      <Appbar {...props}>{children}</Appbar>
    </>
  );
};
