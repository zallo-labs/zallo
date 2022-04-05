import { StrictMode } from 'react';
import { Paragraph } from 'react-native-paper';

import '@ethers';
import { CONFIG } from '~/config';
import { Box } from '@components/Box';
import GqlTest from '@components/Test';
import { WalletProvider } from '@features/wallet/wallet.provider';
import { SafeProvider } from '@features/safe/safe.provider';
import { PaperProvider } from '@features/paper/paper.provider';
import { Root } from '@features/paper/Root';

export default () => (
  <PaperProvider>
    <WalletProvider>
      <SafeProvider>
        <Root>
          <Box flexed center>
            <Paragraph>Open up App.tsx to start working on your app! :)</Paragraph>
            <Paragraph>Environment: {CONFIG.environment}</Paragraph>
            <GqlTest />
          </Box>
        </Root>
      </SafeProvider>
    </WalletProvider>
  </PaperProvider>
);
