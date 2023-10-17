import { materialCommunityIcon } from '@theme/icons';
import { ComponentPropsWithoutRef } from 'react';
import { useDrawerActions, useDrawerContext } from '~/components/drawer/DrawerContextProvider';

const MenuIcon = materialCommunityIcon('menu');

export interface AppbarMenuProps
  extends Omit<ComponentPropsWithoutRef<typeof MenuIcon>, 'onPress'> {}

export function AppbarMenu(props: AppbarMenuProps) {
  const { type } = useDrawerContext();
  const { toggle } = useDrawerActions();

  if (type === 'standard') return null;

  return <MenuIcon onPress={toggle} {...props} />;
}
