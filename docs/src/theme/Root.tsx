import BrowserOnly from '@docusaurus/BrowserOnly';
import React, { ReactNode, Suspense } from 'react';
import { RecoilRoot } from 'recoil';

export interface RootProps {
  children: ReactNode;
}

export default ({ children }: RootProps) => (
  <BrowserOnly fallback={<>{children}</>}>
    {() => (
      <Suspense fallback={null}>
        <RecoilRoot>{children}</RecoilRoot>
      </Suspense>
    )}
  </BrowserOnly>
);
