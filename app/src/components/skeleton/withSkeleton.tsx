import { isFunctionalComponent } from '@util/typing';
import React, { FC, ReactNode, Suspense } from 'react';

export const withSkeleton =
  <Props,>(Component: FC<Props>, Skeleton: ReactNode | FC) =>
  (props: Props) =>
    (
      <Suspense
        fallback={isFunctionalComponent(Skeleton) ? <Skeleton /> : Skeleton}
      >
        <Component {...props} />
      </Suspense>
    );
