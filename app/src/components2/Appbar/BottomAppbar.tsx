import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { omit } from 'lodash';
import { ComponentPropsWithoutRef, useMemo } from 'react';

export type BottomAppbarProps = ComponentPropsWithoutRef<typeof Appbar>;

export const BottomAppbar = (props: BottomAppbarProps) => {
  const baseInsets = useSafeAreaInsets();

  const insets = useMemo(() => omit(baseInsets, 'top'), [baseInsets]);

  return <Appbar elevated safeAreaInsets={insets} {...props} />;
};
