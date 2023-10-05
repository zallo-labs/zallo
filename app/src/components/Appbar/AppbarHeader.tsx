import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { AppbarOptionsProps } from './AppbarOptions';
import { Appbar } from './Appbar';

export interface AppbarHeaderProps extends Omit<NativeStackHeaderProps, 'options'> {
  options: NativeStackHeaderProps['options'] & { appbar?: AppbarOptionsProps };
}

export function AppbarHeader({ route, options }: AppbarHeaderProps) {
  return <Appbar headline={route.name} {...options.appbar} />;
}
