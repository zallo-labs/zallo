import type { CodegenConfig } from '@graphql-codegen/cli';

const plugins = ['typescript', 'typescript-operations', 'typescript-react-apollo'];

export default {
  overwrite: true,
  generates: {
    'src/gql/api/generated.ts': {
      schema: '../api/schema.graphql',
      documents: ['src/**/*', '!src/gql/uniswap/**/*'],
      plugins,
      //
      // preset: 'client-preset', // Enables useFragments - https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
      // presetConfig: {
      //   gqlTagName: 'gql',
      // },
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
          Selector: 'lib#Selector',
          Uint256: 'lib#BigIntlike',
        },
      },
    },
    'src/gql/api/gen/': {
      schema: '../api/schema.graphql',
      documents: ['src/**/*', '!src/gql/uniswap/**/*'],
      preset: 'client-preset', // Enables useFragments - https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
      presetConfig: {
        gqlTagName: 'gql',
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
          Selector: 'lib#Selector',
          Uint256: 'lib#BigIntlike',
        },
        // https://the-guild.dev/graphql/codegen/plugins/typescript/relay-operation-optimizer
        skipDocumentsValidation: true,
        flattenGeneratedTypes: true,
      },
    },
    'src/gql/uniswap/generated.ts': {
      schema: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      documents: 'src/gql/uniswap/**/*.ts',
      plugins,
    },
  },
} satisfies CodegenConfig;
