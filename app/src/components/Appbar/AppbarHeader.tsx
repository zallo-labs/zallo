import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { AppbarOptionsProps } from './AppbarOptions';
import { Appbar } from './Appbar';

export interface AppbarHeaderProps extends Omit<NativeStackHeaderProps, 'options'> {
  options: NativeStackHeaderProps['options'] & { appbar?: AppbarOptionsProps };
}

export function AppbarHeader({ options }: AppbarHeaderProps) {
  if (!options.appbar) return null;

  return <Appbar {...options.appbar} />;
}
