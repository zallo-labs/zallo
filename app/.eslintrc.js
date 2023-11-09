module.exports = {
  env: {
    es2021: true,
    browser: true,
  },
  plugins: ['react', 'react-hooks'],
  extends: ['plugin:react/recommended', 'plugin:react/jsx-runtime'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/display-name': 'off',
    'react/prop-types': ['error', { skipUndeclared: true }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
