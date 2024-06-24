import { SearchIcon } from '@theme/icons';
import { ComponentPropsWithoutRef } from 'react';
import { AppbarMenu } from './AppbarMenu';

export type MenuOrSearchIconProps = ComponentPropsWithoutRef<typeof SearchIcon>;

export function MenuOrSearchIcon(props: MenuOrSearchIconProps) {
  return <AppbarMenu fallback={SearchIcon} {...props} />;
}
