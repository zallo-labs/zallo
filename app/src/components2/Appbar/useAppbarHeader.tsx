import { useCallback, ComponentPropsWithoutRef } from 'react';
import { Appbar } from 'react-native-paper';
import { useScrolled } from './useScrolled';

export type AppbarHeaderProps = ComponentPropsWithoutRef<typeof Appbar.Header>;

export const useAppbarHeader = () => {
  const [scrolled, handleScroll] = useScrolled();

  const AppbarHeader = useCallback(
    (props: AppbarHeaderProps) => (
      <Appbar.Header elevated={scrolled} {...props} />
    ),
    [scrolled],
  );

  return { AppbarHeader, handleScroll };
};
