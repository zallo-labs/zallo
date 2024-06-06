import { materialCommunityIcon } from '@theme/icons';
import { ComponentPropsWithoutRef, FC } from 'react';
import { useDrawerActions, useNavType } from '#/drawer/DrawerContextProvider';
import { ICON_SIZE } from '@theme/paper';

export const MenuIcon = materialCommunityIcon('menu');

type BaseProps = Omit<ComponentPropsWithoutRef<typeof MenuIcon>, 'onPress'>;

export interface AppbarMenuProps extends BaseProps {
  fallback?: FC<BaseProps>;
}

export function AppbarMenu({ fallback: Fallback, ...props }: AppbarMenuProps) {
  const type = useNavType();
  const { toggle } = useDrawerActions();

  return type === 'modal' ? (
    <MenuIcon onPress={toggle} size={ICON_SIZE.medium} {...props} />
  ) : Fallback ? (
    <Fallback {...props} />
  ) : null;
}
