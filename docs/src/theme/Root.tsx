import BrowserOnly from '@docusaurus/BrowserOnly';
import React, { ReactNode, Suspense } from 'react';
import { RecoilRoot } from 'recoil';
import { ApiProvider } from '../components/ApiProvider';

export interface RootProps {
  children: ReactNode;
}

export default ({ children }: RootProps) => (
  <BrowserOnly fallback={<>{children}</>}>
    {() => (
      <Suspense fallback={null}>
        <RecoilRoot>
          <ApiProvider>{children}</ApiProvider>
        </RecoilRoot>
      </Suspense>
    )}
  </BrowserOnly>
);
