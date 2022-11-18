/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from '@emotion/react';
import { ApolloExplorer } from '@apollo/explorer/react';
import { useColorMode } from '@docusaurus/theme-common';
import { BaseEmbeddableExplorerOptions as BaseProps } from '@apollo/explorer/src/EmbeddedExplorer';
import { Interpolation, Theme } from '@emotion/react';
import { useCustomFields } from '@site/src/hooks/useCustomFields';

export interface ExplorerProps {
  initialState?: Partial<BaseProps['initialState']>;
  persistExplorerState?: BaseProps['persistExplorerState'];
  css?: Interpolation<Theme>;
}

export const Explorer = ({ initialState, persistExplorerState = false, css }: ExplorerProps) => {
  const { colorMode } = useColorMode();
  const { apolloGraphRef } = useCustomFields();

  const docLines = initialState?.document?.split('\n').length || 5;

  return (
    <ApolloExplorer
      css={css || { height: `${(docLines + 20) * 1.5}rem` }}
      graphRef={apolloGraphRef}
      persistExplorerState={persistExplorerState}
      initialState={{
        ...initialState,
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
