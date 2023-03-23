import { makeStyles } from '@theme/makeStyles';
import { ComponentPropsWithoutRef } from 'react';
import { Keyboard, ViewStyle } from 'react-native';
import { FAB as Base } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/src/components/Icon';
import { Box } from '../layout/Box';

type BaseProps = ComponentPropsWithoutRef<typeof Base>;

export type FabProps = Omit<BaseProps, 'icon'> &
  Partial<Pick<BaseProps, 'icon'>> & {
    appbar?: boolean;
    align?: ViewStyle['alignItems'];
  };

export const Fab = ({ appbar, align, onPress, style, ...props }: FabProps) => {
  const styles = useStyles(align);

  return (
    <Box style={[styles.container, style]}>
      <Base
        icon={undefined as unknown as IconSource} // https://github.com/callstack/react-native-paper/issues/3594
        size={appbar ? 'small' : 'medium'}
        mode={appbar ? 'flat' : 'elevated'}
        {...props}
        {...(onPress && {
          onPress: (e) => {
            Keyboard.dismiss();
            onPress(e);
          },
        })}
      />
    </Box>
  );
};

const useStyles = makeStyles((_, align?: ViewStyle['alignItems']) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: align ?? 'flex-end',
    margin: 16,
  },
}));
