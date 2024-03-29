import { ComponentPropsWithoutRef } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Portal } from 'react-native-paper';
import Animated, { AnimatedStyle, FadeIn, FadeOut } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

type AnimatedViewProps = ComponentPropsWithoutRef<typeof Animated.View>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ModalProps extends AnimatedViewProps {
  close?: () => void;
  style?: AnimatedStyle<ViewStyle>;
}

export function Modal({ close, children, ...props }: ModalProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <Portal>
      <AnimatedPressable
        onPress={close}
        style={styles.backdrop}
        entering={FadeIn}
        exiting={FadeOut}
      />

      <Animated.View {...props}>{children}</Animated.View>
    </Portal>
  );
}

const stylesheet = createStyleSheet(({ colors }) => ({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },
}));
