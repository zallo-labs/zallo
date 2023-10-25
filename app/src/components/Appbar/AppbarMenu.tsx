import { materialCommunityIcon } from '@theme/icons';
import { ComponentPropsWithoutRef, FC } from 'react';
import { P, match } from 'ts-pattern';
import { useDrawerActions, useMaybeDrawerContext } from '~/components/drawer/DrawerContextProvider';

const MenuIcon = materialCommunityIcon('menu');

type BaseProps = Omit<ComponentPropsWithoutRef<typeof MenuIcon>, 'onPress'>;

export interface AppbarMenuProps extends BaseProps {
  fallback?: FC<BaseProps>;
}

export function AppbarMenu({ fallback: Fallback, ...props }: AppbarMenuProps) {
  const type = useMaybeDrawerContext()?.type;
  const { toggle } = useDrawerActions();

  return match(type)
    .with(P.union('standard', P.nullish), () => (Fallback ? <Fallback {...props} /> : null))
    .otherwise(() => <MenuIcon onPress={toggle} {...props} />);
}
