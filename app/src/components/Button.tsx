import { useWithLoading } from '~/hooks/useWithLoading';
import { Keyboard, View } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { forwardRef } from 'react';

export interface ButtonProps extends PaperButtonProps {}

export const Button = forwardRef<View, PaperButtonProps>((props, ref) => {
  const [onPressloading, onPress] = useWithLoading(props.onPress);
  const loading = props.loading || (props.loading !== false && onPressloading);

  return (
    <PaperButton
      ref={ref}
      disabled={loading}
      {...props}
      loading={loading}
      {...(onPress && {
        onPress: async (e) => {
          Keyboard.dismiss();

          return await onPress(e);
        },
      })}
    />
  );
});
