import { MaybePromise } from 'lib';
import { useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';

export interface ButtonProps extends PaperButtonProps {}

export const Button = ({ onPress, ...props }: PaperButtonProps) => {
  const [loading, setLoading] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <PaperButton
      {...props}
      loading={props.loading || (props.loading !== false && loading)}
      {...(onPress && {
        onPress: async (e) => {
          Keyboard.dismiss();

          const r: MaybePromise<unknown> = onPress(e);

          const isPromise = r instanceof Promise;
          if (isPromise) setLoading(true);

          await r;

          if (isPromise && isMounted.current) setLoading(false);
        },
      })}
    />
  );
};
