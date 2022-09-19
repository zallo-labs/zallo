import { FC, memo, ReactNode, Suspense } from 'react';
import { isFunctionalComponent } from '~/util/typing';

export const withSkeleton = <Props extends {}>(
  Component: FC<Props>,
  Skeleton: FC<Props> | NonNullable<ReactNode>,
) => {
  const MemoizedComponent = memo(Component);

  return memo((props: Props) => (
    <Suspense
      fallback={
        isFunctionalComponent(Skeleton) ? <Skeleton {...props} /> : Skeleton
      }
    >
      <MemoizedComponent {...props} />
    </Suspense>
  ));
};
