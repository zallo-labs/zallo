import type { CodegenConfig } from '@graphql-codegen/cli';

const schema = '../api/schema.graphql';
const documents = 'src/**/*';
const scalars = {
  ID: 'lib#UUID',
  Address: 'lib#Address',
  UAddress: 'lib#UAddress',
  BigInt: 'bigint | string',
  Bytes: 'lib#Hex',
  Bytes32: 'lib#Hex',
  Chain: 'chains#Chain',
  DateTime: 'string',
  Decimal: 'lib#Decimallike',
  MAC: 'string',
  PolicyKey: 'lib#PolicyKey',
  Selector: 'lib#Selector',
  Uint256: 'bigint | string',
  UUID: 'lib#UUID',
  URL: 'string',
  TypedData: 'viem#TypedDataDefinition',
  AbiFunction: 'abitype#AbiFunction',
};

export default {
  overwrite: true,
  generates: {
    'src/gql/api/documents.generated.ts': {
      schema,
      documents,
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        // https://the-guild.dev/graphql/codegen/plugins/typescript/typescript
        // defaultScalarType: 'unknown',
        enumsAsTypes: true,
        scalars,
        withHooks: true,
        withHOC: false,
        withComponent: false,
        // https://the-guild.dev/graphql/codegen/plugins/typescript/relay-operation-optimizer
        flattenGeneratedTypes: true,
      },
    },
    'src/gql/api/generated/': {
      schema,
      documents,
      preset: 'client', // Enables useFragments - https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
      presetConfig: { gqlTagName: 'gql' },
      config: {
        // Allowed options: https://github.com/dotansimha/graphql-code-generator/issues/8562
        // defaultScalarType: 'unknown',
        enumsAsTypes: true,
        scalars,
        dedupeFragments: true,
      },
    },
    'src/gql/api/schema.generated.ts': {
      schema,
      plugins: ['urql-introspection'],
      config: {
        minify: true,
      },
    },
  },
} satisfies CodegenConfig;
