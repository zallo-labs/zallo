import { useState, useCallback, ComponentPropsWithoutRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Appbar } from 'react-native-paper';

type AppbarHeaderProps = ComponentPropsWithoutRef<typeof Appbar.Header>;

export const useAppbarHeader = () => {
  const [hasScrolled, setHasScrolled] = useState(false);

  const scrollHandler = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newHasScrolled = nativeEvent.contentOffset.y > 0;
      if (hasScrolled !== newHasScrolled) setHasScrolled(newHasScrolled);
    },
    [hasScrolled],
  );

  const AppbarHeader = useCallback(
    (props: AppbarHeaderProps) => (
      <Appbar.Header elevated={hasScrolled} {...props} />
    ),
    [hasScrolled],
  );

  return { AppbarHeader, scrollHandler };
};
