import { useScrolled } from '~/util/hook/useScrolled';
import { useCallback, ComponentPropsWithoutRef } from 'react';
import { Appbar } from 'react-native-paper';

export type AppbarHeaderProps = ComponentPropsWithoutRef<typeof Appbar.Header>;

export const useAppbarHeader = () => {
  const [scrolled, handleScroll] = useScrolled();

  const AppbarHeader = useCallback(
    (props: AppbarHeaderProps) => <Appbar.Header elevated={scrolled} {...props} />,
    [scrolled],
  );

  return { AppbarHeader, handleScroll };
};
