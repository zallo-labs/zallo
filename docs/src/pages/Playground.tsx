import React from 'react';
import Layout from '@theme/Layout';
import Explorer from '@site/src/components/Explorer';
import gql from 'graphql-tag';

export default () => (
  <Layout title="Playground">
    <main>
      <Explorer
        style={{ height: '84vh' }}
        persistExplorerState
        initialState={{
          displayOptions: {
            docsPanelState: 'open',
          },
        }}
        document={gql`
          query Users {
            device {
              users {
                id
              }
            }
          }
        `}
      />
    </main>
  </Layout>
);
