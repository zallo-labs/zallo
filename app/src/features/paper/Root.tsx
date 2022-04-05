import React from 'react';
import { useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { PassthroughProps } from '@util/provider';
import { Box } from '@components/Box';

export const Root = ({ children }: PassthroughProps) => {
  const theme = useTheme();
  return (
    <Box height="100%" backgroundColor={theme.colors.background}>
      <StatusBar style="auto" backgroundColor={theme.colors.surface} />
      {children}
    </Box>
  );
};
