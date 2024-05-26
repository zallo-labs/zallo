module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  plugins: ['react-native'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': ['error', { skipUndeclared: true }],
    'react-hooks/rules-of-hooks': 'error',
    // 'react-hooks/exhaustive-deps': 'error',
    'react-hooks/exhaustive-deps': [
      'error',
      { additionalHooks: '(useDeepMemo|useMyOtherCustomHook)' },
    ],
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'error',
    'react-native/no-single-element-style-arrays': 'error',
  },
  ignorePatterns: ['src/lib/ampli'],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
