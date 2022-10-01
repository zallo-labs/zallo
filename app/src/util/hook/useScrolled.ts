import { useCallback, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export type ScrollHandler = (
  event: NativeSyntheticEvent<NativeScrollEvent>,
) => void;

export const useScrolled = () => {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll: ScrollHandler = useCallback(
    ({ nativeEvent }) => {
      const newHasScrolled = nativeEvent.contentOffset.y > 0;
      if (scrolled !== newHasScrolled) setScrolled(newHasScrolled);
    },
    [scrolled],
  );

  return [scrolled, handleScroll] as const;
};
