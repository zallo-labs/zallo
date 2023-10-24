import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { SearchbarProps } from './Searchbar';
import { SearchbarHeader } from './SearchbarHeader';

export interface SearchbarOptionsProps extends SearchbarProps {}

export function SearchbarOptions(options: SearchbarOptionsProps) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ header: SearchbarHeader, searchbar: options });
  }, [navigation.setOptions, options]);

  return null;
}
