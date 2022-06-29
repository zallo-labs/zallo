import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

import { Box, BoxProps } from './Box';

export const Divider = (props: BoxProps) => {
  const { colors } = useTheme();

  return (
    <Box
      borderBottomColor={colors.outline}
      borderBottomWidth={StyleSheet.hairlineWidth}
      alignSelf="stretch"
      {...props}
    ></Box>
  );
};
