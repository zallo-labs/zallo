import { ReactNode } from 'react';
import { Box, BoxProps } from '@components/Box';
import { GestureResponderEvent, Pressable } from 'react-native';

export const PRIMARY_ICON_SIZE = 40;
export const SECONDARY_ICON_SIZE = 24;

export interface ItemProps extends BoxProps {
  Left?: ReactNode;
  Main?: ReactNode;
  Right?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export const Item = ({
  Left,
  Main,
  Right,
  onPress,
  disabled,
  ...boxProps
}: ItemProps) => (
  <Pressable disabled={disabled || !onPress} onPress={!disabled && onPress}>
    <Box
      horizontal
      justifyContent="space-between"
      alignItems="center"
      {...boxProps}
      style={Object.assign(
        {
          ...(disabled && { opacity: 0.4 }),
        },
        boxProps.style,
      )}
    >
      <Box flex={1} horizontal justifyContent="flex-start" alignItems="center">
        {Left && <Box mr={3}>{Left}</Box>}
        {Main && <Box flex={1}>{Main}</Box>}
      </Box>

      {Right}
    </Box>
  </Pressable>
);
