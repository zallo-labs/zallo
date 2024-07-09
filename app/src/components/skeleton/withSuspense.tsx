import { ComponentType, FC, ReactNode, Suspense, memo, useMemo } from 'react';

export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  Fallback: FC<P> | ReactNode = null,
) {
  return function WithSuspense(props: P) {
    return (
      <Suspense fallback={typeof Fallback === 'function' ? <Fallback {...props} /> : Fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}
