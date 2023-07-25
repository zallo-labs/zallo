import type { CodegenConfig } from '@graphql-codegen/cli';

const schema = '../api/schema.graphql';
const documents = 'src/**/*';
const scalars = {
  Address: 'lib#Address',
  BigInt: 'lib#BigIntlike',
  Bytes: 'lib#Hex',
  Bytes32: 'lib#Hex',
  DateTime: 'string',
  Decimal: 'lib#BigIntlike',
  PolicyKey: 'lib#PolicyKey',
  Selector: 'lib#Selector',
  Uint256: 'lib#BigIntlike',
};

export default {
  overwrite: true,
  generates: {
    'src/gql/api/generated.ts': {
      schema,
      documents,
      plugins: [
        '@n1ru4l/graphql-codegen-relay-optimizer-plugin',
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        // https://the-guild.dev/graphql/codegen/plugins/typescript/typescript
        // defaultScalarType: 'unknown',
        enumsAsTypes: true,
        scalars,
        withHooks: true,
        withHOC: false,
        withComponent: false,
        // https://the-guild.dev/graphql/codegen/plugins/typescript/relay-operation-optimizer
        skipDocumentsValidation: true,
        flattenGeneratedTypes: true,
      },
    },
    'src/gql/api/gen/': {
      schema,
      documents,
      preset: 'client', // Enables useFragments - https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        // https://the-guild.dev/graphql/codegen/plugins/typescript/typescript
        defaultScalarType: 'unknown',
        enumsAsTypes: true,
        scalars,
        // https://the-guild.dev/graphql/codegen/plugins/typescript/relay-operation-optimizer
        skipDocumentsValidation: true,
        flattenGeneratedTypes: true,
      },
    },
    'src/gql/api/schema.ts': {
      schema,
      plugins: ['urql-introspection'],
      config: {
        minify: true,
      },
    },
  },
} satisfies CodegenConfig;
