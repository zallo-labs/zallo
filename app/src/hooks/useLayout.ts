import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { P, match } from 'ts-pattern';

export type LayoutDetails = ReturnType<typeof useLayout>;
export type LayoutClass = ReturnType<typeof getLayoutClass>;

export function useLayout() {
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();

  return {
    ...frame,
    insets,
    class: getLayoutClass(frame.width),
  };
}

function getLayoutClass(width: number) {
  return match(width)
    .with(P.number.lt(600), () => 'compact' as const)
    .with(P.number.between(600, 839), () => 'medium' as const)
    .otherwise(() => 'expanded' as const);
}
