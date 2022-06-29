import { ReactNode } from 'react';
import { Box, BoxProps } from '@components/Box';
import { GestureResponderEvent } from 'react-native';
import { ItemSkeleton } from './ItemSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { TouchableRipple, useTheme } from 'react-native-paper';

export interface ItemProps extends BoxProps {
  Left?: ReactNode;
  leftContainer?: BoxProps;
  Main?: ReactNode;
  mainContainer?: BoxProps;
  Right?: ReactNode;
  rightContainer?: BoxProps;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  selected?: boolean;
}

export const Item = withSkeleton(
  ({
    Left,
    leftContainer,
    Main,
    mainContainer,
    Right,
    rightContainer,
    onPress,
    onLongPress,
    disabled,
    selected,
    ...boxProps
  }: ItemProps) => {
    const { colors } = useTheme();

    return (
      <TouchableRipple
        disabled={disabled || !onPress}
        onPress={!disabled && onPress}
        onLongPress={!disabled && onLongPress}
        rippleColor={colors.primary}
      >
        <Box
          horizontal
          justifyContent="space-between"
          {...boxProps}
          style={[
            {
              ...(disabled && { opacity: 0.4 }),
              ...(selected && {
                backgroundColor: colors.accentContainer,
                borderRadius: 1000,
              }),
            },
            boxProps.style,
          ]}
        >
          {Left && (
            <Box vertical justifyContent="center" mr={3} {...leftContainer}>
              {Left}
            </Box>
          )}

          {Main && (
            <Box flex={1} vertical justifyContent="center" {...mainContainer}>
              {Main}
            </Box>
          )}

          {Right && (
            <Box vertical justifyContent="center" {...rightContainer}>
              {Right}
            </Box>
          )}
        </Box>
      </TouchableRipple>
    );
  },
  ItemSkeleton,
);
