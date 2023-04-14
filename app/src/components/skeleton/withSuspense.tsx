import { FC, ReactNode, Suspense } from 'react';
import { isFunctionalComponent } from '~/util/typing';

export const withSuspense =
  <Props extends {}>(Component: FC<Props>, Fallback: FC<Props> | NonNullable<ReactNode>) =>
  (props: Props) =>
    (
      <Suspense fallback={isFunctionalComponent(Fallback) ? <Fallback {...props} /> : Fallback}>
        <Component {...props} />
      </Suspense>
    );
