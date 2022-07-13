import { FC, ReactNode, Suspense } from 'react';
import { isFunctionalComponent } from '@util/typing';

export const withSkeleton =
  <Props,>(Component: FC<Props>, Skeleton: NonNullable<ReactNode> | FC) =>
  (props: Props) =>
    (
      <Suspense
        fallback={isFunctionalComponent(Skeleton) ? <Skeleton /> : Skeleton}
      >
        <Component {...props} />
      </Suspense>
    );
