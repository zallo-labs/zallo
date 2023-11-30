import { useContextKey as useRouteContextKey } from 'expo-router/src/Route';
import { getContextKey, stripGroupSegmentsFromPath } from 'expo-router/src/matchers';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { useEffect } from 'react';
import { SharedValue, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

const routeOffsets = atomFamily((_route: string) => atom<SharedValue<number> | null>(null));

export function useRouteScrollHandler(key?: string) {
  const setOffset = useSetAtom(routeOffsets(useKey(key)));

  const offsetY = useSharedValue(0);
  useEffect(() => {
    setOffset(offsetY);
  }, [offsetY, setOffset]);

  return useAnimatedScrollHandler((event) => {
    console.log(event.contentOffset.y);
    offsetY.value = event.contentOffset.y;
  });
}

export function useRouteScrollOffset(key?: string) {
  const fallback = useSharedValue(0);
  return useAtomValue(routeOffsets(useKey(key))) ?? fallback;
}

function useKey(key?: string) {
  const routeKey = useRouteContextKey();
  return getContextKey(stripGroupSegmentsFromPath(key ?? routeKey));
}
