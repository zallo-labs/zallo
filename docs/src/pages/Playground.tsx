import React from 'react';
import Layout from '@theme/Layout';
import gql from 'graphql-tag';
import Explorer from '../components/Explorer';

const FOOTER_HEIGHT = '12.25vh';

export default () => (
  <Layout title="Playground">
    <main>
      <Explorer
        style={{ height: `calc(100vh - var(--ifm-navbar-height) - ${FOOTER_HEIGHT})` }}
        persistExplorerState
        initialState={{
          displayOptions: {
            docsPanelState: 'open',
          },
        }}
        document={gql`
          query Users {
            accounts {
              id
              name
            }
          }
        `}
      />
    </main>
  </Layout>
);
