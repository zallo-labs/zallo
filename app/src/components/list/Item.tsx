import { ForwardedRef, forwardRef, ReactNode } from 'react';
import { Box, BoxProps } from '@components/Box';
import { GestureResponderEvent, Pressable, View } from 'react-native';
import { ItemSkeleton } from './ItemSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';

export const PRIMARY_ICON_SIZE = 40;
export const SECONDARY_ICON_SIZE = 24;

export interface ItemProps extends BoxProps {
  Left?: ReactNode;
  leftContainer?: BoxProps;
  Main?: ReactNode;
  Right?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export const Item = withSkeleton(
  ({
    Left,
    leftContainer,
    Main,
    Right,
    onPress,
    onLongPress,
    disabled,
    ...boxProps
  }: ItemProps) => (
    <Pressable
      disabled={disabled || !onPress}
      onPress={!disabled && onPress}
      onLongPress={!disabled && onLongPress}
    >
      <Box
        horizontal
        justifyContent="space-between"
        alignItems="center"
        {...boxProps}
        style={[
          {
            ...(disabled && { opacity: 0.4 }),
          },
          boxProps.style,
        ]}
      >
        <Box
          flex={1}
          horizontal
          justifyContent="flex-start"
          alignItems="center"
        >
          {Left && (
            <Box mr={3} {...leftContainer}>
              {Left}
            </Box>
          )}
          {Main && <Box flex={1}>{Main}</Box>}
        </Box>

        {Right}
      </Box>
    </Pressable>
  ),
  ItemSkeleton,
);
