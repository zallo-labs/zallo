import { useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import { ChildrenProps } from '@util/provider';
import { Box } from '@components/Box';

export const Root = ({ children }: ChildrenProps) => {
  const { colors } = useTheme();
  return (
    <Box vertical height="100%">
      <StatusBar style="inverted" backgroundColor={colors.background} />
      {children}
    </Box>
  );
};
