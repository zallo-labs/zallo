const tsconfig = require('./tsconfig.json');
const { babelOptimizerPlugin: gqlBabelOptimizer } = require('@graphql-codegen/client-preset');

const getAliasPaths = () => {
  const trimPath = (path) => (path.endsWith('/*') ? path.substr(0, path.length - 2) : path);

  return Object.fromEntries(
    Object.entries(tsconfig.compilerOptions.paths).map(([key, paths]) => [
      trimPath(key),
      trimPath(paths[0]),
    ]),
  );
};

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            crypto: 'react-native-quick-crypto',
            stream: 'stream-browserify',
            buffer: '@craftzdog/react-native-buffer',
            '@ethersproject/pbkdf2': './src/util/patches/pbkdf2.js',
            // TODO: remove @ledger aliases in RN 0.72 by enabling metro package exports
            // https://github.com/LedgerHQ/ledger-live/issues/763
            // https://reactnative.dev/blog/2023/06/21/0.72-metro-package-exports-symlinks#enabling-beta-features
            '@ledgerhq/cryptoassets': '@ledgerhq/cryptoassets/lib-es',
            '@ledgerhq/domain-service': '@ledgerhq/domain-service/lib-es',
            '@ledgerhq/evm-tools': '@ledgerhq/evm-tools/lib-es',
            '@ledgerhq/live-network': '@ledgerhq/live-network/lib-es',
            ...getAliasPaths(),
          },
        },
      ],
      [
        'formatjs',
        // {
        //   idInterpolationPattern: '[sha512:contenthash:base64:6]',
        //   ast: true,
        // },
      ],
      'react-native-reanimated/plugin',
      'lodash',
    ],
    env: {
      production: {
        plugins: [
          'react-native-paper/babel',
          'transform-remove-console',
          // [gqlBabelOptimizer, { artifactDirectory: './src/gql/api/generated', gqlTagName: 'gql' }], // TODO: enable with preset: 'client-preset'
        ],
      },
    },
  };
};
