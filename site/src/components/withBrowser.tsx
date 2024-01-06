import React, { FC, Suspense } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// eslint-disable-next-line @typescript-eslint/ban-types
export const withBrowser = <Props extends {}>(Component: FC<Props>) => {
  return (props: Props) => (
    <BrowserOnly>
      {() => (
        <Suspense fallback={null}>
          <Component {...props} />
        </Suspense>
      )}
    </BrowserOnly>
  );
};
