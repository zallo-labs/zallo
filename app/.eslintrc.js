module.exports = {
  plugins: ['react', 'react-hooks', 'react-native'],
  extends: ['expo', 'eslint:recommended', 'plugin:@tanstack/eslint-plugin-query/recommended'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/display-name': 'off',
    'react/prop-types': ['error', { skipUndeclared: true }],
    'react-hooks/rules-of-hooks': 'error',
    // 'react-hooks/exhaustive-deps': 'error',
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(useDeepMemo|useMyOtherCustomHook)',
      },
    ],
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'error',
    'react-native/no-single-element-style-arrays': 'error',
  },
  ignorePatterns: ['src/lib/ampli'],
};
