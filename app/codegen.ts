import type { CodegenConfig } from '@graphql-codegen/cli';
require('dotenv-vault-core').config({ path: '../.env' });

const plugins = ['typescript', 'typescript-operations', 'typescript-react-apollo'];

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    'src/gql/generated.api.tsx': {
      schema: '../api/schema.graphql',
      documents: 'src/{mutations,queries}/**/*.api.ts',
      plugins,
    },
    'src/gql/generated.sub.tsx': {
      schema: process.env.SUBGRAPH_GQL_URL,
      documents: 'src/{mutations,queries}/**/*.sub.ts',
      plugins,
    },
    'src/gql/generated.uni.tsx': {
      schema: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      documents: 'src/{mutations,queries}/**/*.uni.ts',
      plugins,
    },
  },
  config: {
    // https://the-guild.dev/graphql/codegen/plugins/typescript/typescript
    // defaultScalarType: 'unknown',
    enumsAsTypes: true,
  },
};

export default config;
