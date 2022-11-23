import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    'src/api.generated.ts': {
      schema: '../api/schema.graphql',
      documents: '{src,blog,docs}/**/*.{mdx,ts,tsx,graphql}',
      plugins: ['typescript', 'typescript-operations'],
    },
  },
};

export default config;
