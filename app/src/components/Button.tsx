import { useWithLoading } from '~/hooks/useWithLoading';
import { Keyboard, View } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { forwardRef } from 'react';

export interface ButtonProps extends PaperButtonProps {}

export const Button = forwardRef<View, PaperButtonProps>((props, ref) => {
  const [loading, onPress] = useWithLoading(props.onPress);

  return (
    <PaperButton
      ref={ref}
      {...props}
      loading={props.loading || (props.loading !== false && loading)}
      {...(onPress && {
        onPress: async (e) => {
          Keyboard.dismiss();

          return await onPress(e);
        },
      })}
    />
  );
});
