import { createStyles, useStyles } from '@theme/styles';
import { forwardRef } from 'react';
import { Pressable, View } from 'react-native';

export type PressableOpacityProps = React.ComponentProps<typeof Pressable>;

export const PressableOpacity = forwardRef<View, PressableOpacityProps>((props, ref) => {
  const { styles } = useStyles(stylesheet);

  const pressable = !!(props.onPress || props.onPressIn || props.onPressOut || props.onLongPress);
  const hoverable = pressable || !!props.onHoverIn || !!props.onHoverOut;

  return (
    <Pressable
      {...props}
      ref={ref}
      style={(state) => [
        hoverable && (state as { hovered?: boolean }).hovered && styles.hovered, // state.hovered exists on web
        pressable && state.pressed && styles.pressed,
        typeof props.style === 'function' ? props.style(state) : props.style,
      ]}
    />
  );
});

const stylesheet = createStyles(({ colors }) => ({
  hovered: {
    backgroundColor: colors.surfaceContainer.high,
  },
  pressed: {
    backgroundColor: colors.surfaceContainer.highest,
  },
}));
