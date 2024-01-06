module.exports = {
  env: {
    es2021: true,
    browser: true,
  },
  plugins: ['react', 'react-hooks', 'react-native'],
  extends: [
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/display-name': 'off',
    'react/prop-types': ['error', { skipUndeclared: true }],
    'react-hooks/rules-of-hooks': 'error',
    // 'react-hooks/exhaustive-deps': 'error',
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(useMyCustomHook|useMyOtherCustomHook)',
      },
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
