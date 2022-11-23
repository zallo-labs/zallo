import { FC, ReactNode, Suspense } from 'react';
import { isFunctionalComponent } from '~/util/typing';

// eslint-disable-next-line @typescript-eslint/ban-types
export const withSkeleton = <Props extends {}>(
  Component: FC<Props>,
  Skeleton: FC<Props> | NonNullable<ReactNode>,
) => {
  return (props: Props) => (
    <Suspense fallback={isFunctionalComponent(Skeleton) ? <Skeleton {...props} /> : Skeleton}>
      <Component {...props} />
    </Suspense>
  );
};
