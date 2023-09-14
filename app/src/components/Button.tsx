import { useWithLoading } from '@hook/useIsPromised';
import { Keyboard } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';

export interface ButtonProps extends PaperButtonProps {}

export const Button = (props: PaperButtonProps) => {
  const [loading, onPress] = useWithLoading(props.onPress);

  return (
    <PaperButton
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
};
