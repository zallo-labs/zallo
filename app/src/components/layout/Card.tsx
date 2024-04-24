import { createStyles, useStyles } from '@theme/styles';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Surface, TouchableRipple, TouchableRippleProps } from 'react-native-paper';

/**
 * https://m3.material.io/components/cards/specs
 */

type Type = 'filled' | 'elevated' | 'outlined';

export interface CardProps extends Pick<TouchableRippleProps, 'onPress' | 'onLongPress'> {
  children: ReactNode;
  type?: Type;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, type = 'filled', style, onPress, onLongPress }: CardProps) {
  const { styles } = useStyles(stylesheet);
  const pressable = onPress || onLongPress;

  return (
    <Surface elevation={type === 'elevated' ? 1 : 0} style={[styles.surface(type), style]}>
      {pressable ? (
        <TouchableRipple onPress={onPress} onLongPress={onLongPress}>
          {children}
        </TouchableRipple>
      ) : (
        children
      )}
    </Surface>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  surface: (type: Type) => ({
    borderRadius: corner.m,
    backgroundColor: {
      filled: colors.surfaceContainer.highest,
      elevated: colors.surfaceContainer.low,
      outlined: colors.surface,
    }[type],
    ...(type === 'outlined' && {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
    }),
  }),
}));
