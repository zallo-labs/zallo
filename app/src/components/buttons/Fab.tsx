import { ComponentPropsWithoutRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Keyboard } from 'react-native';
import { FAB as PaperFAB } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/src/components/Icon';

type BaseProps = ComponentPropsWithoutRef<typeof PaperFAB>;

export type FabProps = Omit<BaseProps, 'icon'> &
  Partial<Pick<BaseProps, 'icon'>> & {
    appbar?: boolean;
  };

export const Fab = ({ appbar, onPress, style, ...props }: FabProps) => {
  return (
    <View style={[styles.container, style]}>
      <PaperFAB
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'flex-end',
    margin: 16,
  },
});
