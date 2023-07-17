module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: '2021',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'neverthrow',
  ],
  plugins: ['@typescript-eslint', 'react-hooks'],
  env: {
    es2021: true,
    browser: true,
    node: true,
    mocha: true,
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': [
      'warn',
      { additionalHooks: '(useRecoilCallback|useRecoilTransaction_UNSTABLE)' },
    ],
    'neverthrow/must-use-result': 'error',
  },
};
