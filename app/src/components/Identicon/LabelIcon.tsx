import { createStyles, useStyles } from '@theme/styles';
import { memo } from 'react';
import {
  StyleProp,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useMemoApply } from '~/hooks/useMemoized';

export interface LabelIconProps extends Omit<ViewProps, 'style'> {
  label: string;
  size?: number;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const LabelIcon = memo(
  ({ label: l, size, containerStyle, labelStyle, ...viewProps }: LabelIconProps) => {
    const { styles } = useStyles(
      useMemoApply(getStylesheet, { size, fontScale: useWindowDimensions().fontScale }),
    );

    const label = l.slice(0, Math.min(l?.length, 1)).toUpperCase();

    return (
      <View {...viewProps} style={[styles.container, containerStyle]}>
        <Text style={[styles.label, labelStyle]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    );
  },
);

interface StyleParams {
  size?: number;
  fontScale: number;
}

const getStylesheet = ({ size, fontScale }: StyleParams) =>
  createStyles(({ colors, iconSize }) => {
    size ??= iconSize.medium;

    return {
      container: {
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.tertiaryContainer,
      },
      label: {
        fontSize: size / 2,
        lineHeight: size / fontScale,
        color: colors.tertiary,
        textAlign: 'center',
        textAlignVertical: 'center',
      },
    };
  });
