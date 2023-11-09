module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    mocha: true,
  },
  parser: '@typescript-eslint/parser',
  // parserOptions: {
  //   ecmaVersion: '2021',
  //   sourceType: 'module',
  // },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:neverthrow/recommended', // https://github.com/mdbetancourt/eslint-plugin-neverthrow/issues/14
    'prettier' /* last */,
  ],
  plugins: ['@typescript-eslint', 'neverthrow'],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
  ignorePatterns: ['**/node_modules', '**/dist', '**/*generated*'],
};
