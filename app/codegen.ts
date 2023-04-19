import type { CodegenConfig } from '@graphql-codegen/cli';
require('dotenv-vault-core').config({ path: '../.env' });

const plugins = ['typescript', 'typescript-operations', 'typescript-react-apollo'];

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    'src/gql/api/generated.ts': {
      schema: '../api/schema.graphql',
      documents: 'src/gql/api/**/*.ts',
      plugins,
    },
    'src/gql/uniswap/generated.ts': {
      schema: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      documents: 'src/gql/uniswap/**/*.ts',
      plugins,
    },
  },
  config: {
    // https://the-guild.dev/graphql/codegen/plugins/typescript/typescript
    // defaultScalarType: 'unknown',
    enumsAsTypes: true,
    scalars: {
      Address: 'lib#Address',
      BigInt: 'lib#BigIntlike',
      Bytes: 'lib#Hex',
      Bytes32: 'lib#Hex',
      DateTime: 'string',
      Decimal: 'lib#BigIntlike',
      PolicyKey: 'lib#PolicyKey',
      Uint256: 'lib#BigIntlike',
    },
  },
};

export default config;
