import { View } from 'react-native';
import { useTheme } from '@theme/paper';
import { ReactNode } from 'react';

export interface BackgroundProps {
  children: ReactNode;
}

export const Background = ({ children }: BackgroundProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.background,
      }}
    >
      {children}
    </View>
  );
};
