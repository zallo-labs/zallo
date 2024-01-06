import { DrawerHeaderProps } from '@react-navigation/drawer';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';

import { Appbar } from './Appbar';
import { AppbarOptionsProps } from './AppbarOptions';

type NavHeaderProps = NativeStackHeaderProps | DrawerHeaderProps;

export interface AppbarHeaderProps extends Omit<NavHeaderProps, 'options'> {
  options: NavHeaderProps['options'] & { appbar?: AppbarOptionsProps };
}

export function AppbarHeader({ options }: AppbarHeaderProps) {
  return <Appbar {...options.appbar} />;
}
