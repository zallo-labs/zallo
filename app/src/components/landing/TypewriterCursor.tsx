import { ComponentPropsWithoutRef, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type AnimatedTextProps = ComponentPropsWithoutRef<typeof Animated.Text>;
export interface TypewriterCursorProps extends Omit<AnimatedTextProps, 'children'> {
  blinkDelay?: number;
}

export function TypewriterCursor({ blinkDelay = 500, ...props }: TypewriterCursorProps) {
  const opacity = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withDelay(blinkDelay, withTiming(1, { duration: 0 })),
        withDelay(blinkDelay, withTiming(0, { duration: 0 })),
      ),
      -1,
    );
  }, [blinkDelay, opacity]);

  return (
    <Animated.Text {...props} style={[style, props.style]}>
      |
    </Animated.Text>
  );
}
