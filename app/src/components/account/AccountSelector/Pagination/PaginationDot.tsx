import { memo } from 'react';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@theme/paper';
import { StyleSheet, View } from 'react-native';

const SELECTED_HEIGHT = 8;

export interface PaginationDotProps {
  selected: boolean;
}

export const PaginationDot = memo(({ selected }: PaginationDotProps) => {
  const { colors } = useTheme();

  const progress = useDerivedValue(() => withTiming(selected ? 1 : 0));

  const animatedStyle = useAnimatedStyle(() => {
    const size = interpolate(progress.value, [0, 1], [6, SELECTED_HEIGHT]);

    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.surfaceDisabled, colors.onBackground],
      ),
      width: size,
      height: size,
      borderRadius: interpolate(progress.value, [0, 1], [3, 4]),
    };
  });

  return (
    <View style={styles.root}>
      <Animated.View style={animatedStyle} />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    height: SELECTED_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
