import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Appbar } from './Appbar';
import { AppbarOptionsProps } from './AppbarOptions';

export interface AppbarHeaderProps extends Omit<NativeStackHeaderProps, 'options'> {
  options: NativeStackHeaderProps['options'] & { appbar?: AppbarOptionsProps };
}

export function AppbarHeader({ options }: AppbarHeaderProps) {
  if (!options.appbar) return null;

  return <Appbar {...options.appbar} />;
}
