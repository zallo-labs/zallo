import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { SearchbarProps } from './Searchbar';
import { SearchbarHeader } from './SearchbarHeader';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';

export interface SearchbarOptionsProps extends SearchbarProps {}

export function SearchbarOptions(options: SearchbarOptionsProps) {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: (props: NativeStackHeaderProps) => <SearchbarHeader {...props} />,
      searchbar: options,
    });
  }, [navigation, options]);

  return null;
}
