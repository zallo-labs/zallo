/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from '@emotion/react';
import { ApolloExplorer } from '@apollo/explorer/react';
import { useColorMode } from '@docusaurus/theme-common';
import { BaseEmbeddableExplorerOptions as BaseProps } from '@apollo/explorer/src/EmbeddedExplorer';
import { Interpolation, Theme } from '@emotion/react';
import { useCustomFields } from '@site/src/hooks/useCustomFields';
import gql from 'graphql-tag';
import { print } from 'graphql';
import { useAuthorization, useDevice } from '../hooks/useDevice';
import { RecoilRoot } from 'recoil';
import { Suspense } from 'react';

export interface ExplorerProps {
  document: ReturnType<typeof gql>;
  variables?: NonNullable<BaseProps['initialState']>['variables'];
  initialState?: Partial<BaseProps['initialState']>;
  persistExplorerState?: BaseProps['persistExplorerState'];
  style?: Interpolation<Theme>;
}

const Explorer = ({
  document: documentProp,
  variables,
  initialState,
  persistExplorerState = false,
  style,
}: ExplorerProps) => {
  const { colorMode } = useColorMode();
  const { apolloGraphRef } = useCustomFields();

  const document = print(documentProp);
  const docLines = document.split('\n').length || 5;

  const variableLines = JSON.stringify(variables, null, 2)?.split('\n').length ?? 0;

  return (
    <ApolloExplorer
      css={style || { height: `${(docLines + variableLines + 10) * 1.5}rem` }}
      graphRef={apolloGraphRef}
      includeCookies
      persistExplorerState={persistExplorerState}
      initialState={{
        ...initialState,
        document,
        variables,
        headers: {
          authorization: useAuthorization(),
          device: useDevice().address,
          ...initialState?.headers,
        },
        displayOptions: {
          docsPanelState: 'closed',
          showHeadersAndEnvVars: true,
          ...initialState?.displayOptions,
          theme: colorMode,
        },
      }}
    />
  );
};

export default (props: ExplorerProps) => (
  <Suspense fallback={null}>
    <RecoilRoot>
      <Explorer {...props} />
    </RecoilRoot>
  </Suspense>
);
