import React from 'react';
import Layout from '@theme/Layout';
import { Explorer } from '@site/src/components/Explorer';

export default () => (
  <Layout title="Playground">
    <main>
      <Explorer
        css={{ height: '84vh' }}
        persistExplorerState
        initialState={{
          displayOptions: {
            docsPanelState: 'open',
          },
        }}
      />
    </main>
  </Layout>
);
