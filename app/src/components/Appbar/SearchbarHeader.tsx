import type { SearchbarOptionsProps } from './SearchbarOptions';
import { DrawerHeaderProps } from '@react-navigation/drawer';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';

import { Searchbar } from '~/components/Appbar/Searchbar';

type NavHeaderProps = NativeStackHeaderProps | DrawerHeaderProps;

export interface SearchbarHeaderProps extends Omit<NavHeaderProps, 'options'> {
  options: NavHeaderProps['options'] & { searchbar?: SearchbarOptionsProps };
}

export function SearchbarHeader({ options }: SearchbarHeaderProps) {
  return <Searchbar {...options.searchbar} />;
}
