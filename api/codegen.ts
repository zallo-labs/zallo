import type { CodegenConfig } from '@graphql-codegen/cli';

export default {
  overwrite: true,
  generates: {
    'src/features/prices/__generated__/': {
      schema: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      documents: 'src/features/prices/**/*.ts',
      preset: 'client', // Enables useFragments - https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        scalars: {
          BigDecimal: 'string',
        },
        // https://the-guild.dev/graphql/codegen/plugins/typescript/relay-operation-optimizer
        skipDocumentsValidation: true,
        flattenGeneratedTypes: true,
      },
    },
  },
} satisfies CodegenConfig;
