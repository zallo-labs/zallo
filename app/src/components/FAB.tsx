import { ComponentPropsWithoutRef } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import { FAB as Base } from 'react-native-paper';

export type FABProps = ComponentPropsWithoutRef<typeof Base> & {
  appbar?: boolean;
};

export const FAB = ({ appbar, onPress, ...props }: FABProps) => (
  <Base
    {...props}
    {...(appbar && {
      size: 'small',
      mode: 'flat',
    })}
    {...(onPress && {
      onPress: () => {
        Keyboard.dismiss();
        onPress();
      },
    })}
    style={[styles.bottom, appbar ? styles.appbarMargin : styles.regularMargin, props.style]}
  />
);

const styles = StyleSheet.create({
  bottom: {
    position: 'absolute',
    margin: 32,
    right: 0,
    bottom: 0,
  },
  regularMargin: {
    margin: 32,
  },
  appbarMargin: {
    margin: 16,
  },
});
