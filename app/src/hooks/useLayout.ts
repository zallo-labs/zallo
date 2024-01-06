import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { match, P } from 'ts-pattern';

export type LayoutDetails = ReturnType<typeof useLayout>;
export type LayoutClass = ReturnType<typeof getLayoutClass>;

export function useLayout() {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return {
    window,
    insets,
    layout: getLayoutClass(window.width),
  };
}

function getLayoutClass(width: number) {
  return match(width)
    .with(P.number.lt(600), () => 'compact' as const)
    .with(P.number.between(600, 839), () => 'medium' as const)
    .otherwise(() => 'expanded' as const);
}
