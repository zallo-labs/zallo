import { materialCommunityIcon } from '@theme/icons';
import { ComponentPropsWithoutRef, FC } from 'react';
import { useDrawerActions, useDrawerContext } from '~/components/drawer/DrawerContextProvider';

const MenuIcon = materialCommunityIcon('menu');

type BaseProps = Omit<ComponentPropsWithoutRef<typeof MenuIcon>, 'onPress'>;

export interface AppbarMenuProps extends BaseProps {
  fallback?: FC<BaseProps>;
}

export function AppbarMenu({ fallback: Fallback, ...props }: AppbarMenuProps) {
  const { type } = useDrawerContext();
  const { toggle } = useDrawerActions();

  if (type === 'standard') return Fallback ? <Fallback {...props} /> : null;

  return <MenuIcon onPress={toggle} {...props} />;
}
