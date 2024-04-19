import { useWithLoading } from '~/hooks/useWithLoading';
import { ComponentPropsWithoutRef } from 'react';
import { Keyboard } from 'react-native';
import { FAB as PaperFAB } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { createStyles, useStyles } from '@theme/styles';

type BaseProps = ComponentPropsWithoutRef<typeof PaperFAB>;

export type FabProps = Omit<BaseProps, 'icon'> &
  Partial<Pick<BaseProps, 'icon'>> & {
    appbar?: boolean;
    position?: 'absolute' | 'relative';
  };

export const Fab = ({ appbar, position = 'absolute', style, ...props }: FabProps) => {
  const { styles } = useStyles(stylesheet);
  const [loading, onPress] = useWithLoading(props.onPress);

  return (
    <PaperFAB
      icon={undefined as unknown as IconSource} // https://github.com/callstack/react-native-paper/issues/3594
      size={appbar ? 'small' : 'medium'}
      mode={appbar ? 'flat' : 'elevated'}
      style={[position === 'absolute' && styles.absolute, style]}
      {...props}
      loading={props.loading || (props.loading !== false && loading)}
      {...(onPress && {
        onPress: (e) => {
          Keyboard.dismiss();
          onPress(e);
        },
      })}
    />
  );
};

const stylesheet = createStyles((_theme, { insets }) => ({
  absolute: {
    position: 'absolute',
    bottom: 16 + insets.bottom,
    right: 16,
  },
}));
