import React from 'react';
import Layout from '@theme/Layout';
import gql from 'graphql-tag';
import { Explorer } from '../components/Explorer';

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
