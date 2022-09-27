import { FC, memo, ReactNode, Suspense } from 'react';
import { isFunctionalComponent } from '~/util/typing';

export const withSkeleton = <Props extends {}>(
  Component: FC<Props>,
  Skeleton: FC<Props> | NonNullable<ReactNode>,
) => {
  return (props: Props) => (
    <Suspense
      fallback={
        isFunctionalComponent(Skeleton) ? <Skeleton {...props} /> : Skeleton
      }
    >
      {/* <MemoizedComponent {...props} /> */}
      <Component {...props} />
    </Suspense>
  );
};
