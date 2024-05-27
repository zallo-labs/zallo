module.exports = {
  root: true,
  ignorePatterns: ['**/node_modules', '**/dist', '**/*generated*'],
  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier' /* last */,
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
  parser: '@typescript-eslint/parser',
  env: {
    es2021: true,
    node: true,
    mocha: true,
  },
};
