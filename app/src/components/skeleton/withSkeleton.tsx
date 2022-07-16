import { FC, ReactNode, Suspense } from 'react';
import { isFunctionalComponent } from '@util/typing';

export const withSkeleton =
  <Props,>(
    Component: FC<Props>,
    Skeleton: FC<Props> | NonNullable<ReactNode>,
  ) =>
  (props: Props) =>
    (
      <Suspense
        fallback={
          isFunctionalComponent(Skeleton) ? <Skeleton {...props} /> : Skeleton
        }
      >
        <Component {...props} />
      </Suspense>
    );
