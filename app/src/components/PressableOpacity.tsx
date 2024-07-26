import { createStyles, useStyles } from '@theme/styles';
import { forwardRef } from 'react';
import { Pressable, PressableProps, View } from 'react-native';

export interface PressableOpacityProps extends PressableProps {
  noHover?: boolean;
  selected?: boolean;
}

export const PressableOpacity = forwardRef<View, PressableOpacityProps>((props, ref) => {
  const { styles } = useStyles(stylesheet);

  const hoverableProps =
    props.onPress ||
    props.onPressIn ||
    props.onPressOut ||
    props.onLongPress ||
    props.onHoverIn ||
    props.onHoverOut;
  const hoverable = !props.noHover && hoverableProps;

  return (
    <Pressable
      {...props}
      ref={ref}
      style={(state) => [
        typeof props.style === 'function' ? props.style(state) : props.style,
        props.selected && styles.selected,
        state.pressed && styles.pressed,
        !props.selected && hoverable && (state as { hovered?: boolean }).hovered && styles.hovered, // state.hovered exists on web
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
  selected: {
    backgroundColor: colors.secondaryContainer,
  },
}));
