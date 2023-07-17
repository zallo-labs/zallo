import { FC, ReactNode, Suspense } from 'react';
import { isFunctionalComponent } from '~/util/typing';

export const withSuspense =
  <Props extends {}, FallbackProps extends Partial<Props & any>>(
    Component: FC<Props>,
    Fallback: FC<FallbackProps> | ReactNode,
  ) =>
  (props: Props) =>
    (
      <Suspense
        fallback={
          isFunctionalComponent(Fallback) ? <Fallback {...props} /> : (Fallback as ReactNode)
        }
      >
        <Component {...props} />
      </Suspense>
    );
