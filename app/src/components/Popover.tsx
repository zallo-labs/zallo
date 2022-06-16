import { ChildrenProps } from '@util/children';
import { ComponentPropsWithoutRef } from 'react';
import { Platform, StatusBar } from 'react-native';
import PopoverBase from 'react-native-popover-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const verticalOffset = Platform.OS === 'android' ? -StatusBar.currentHeight : 0;

export type PopoverProps = ComponentPropsWithoutRef<typeof PopoverBase> &
  ChildrenProps;

export const Popover = ({ children, ...props }: PopoverProps) => {
  const insets = useSafeAreaInsets();

  return (
    <PopoverBase
      {...props}
      displayAreaInsets={insets}
      verticalOffset={verticalOffset + (props.verticalOffset ?? 0)}
    >
      {children}
    </PopoverBase>
  );
};
