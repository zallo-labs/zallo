import { ComponentType, FC, ReactNode, Suspense, memo, useMemo } from 'react';

export function withSuspense<P extends object>(
  Component: ComponentType<P>,
  Fallback: FC<P> | ReactNode = null,
) {
  return memo(function WithSuspense(props: P) {
    const component = useMemo(() => <Component {...props} />, [props]);

    return (
      <Suspense fallback={typeof Fallback === 'function' ? <Fallback {...props} /> : Fallback}>
        {component}
      </Suspense>
    );
  });
}
