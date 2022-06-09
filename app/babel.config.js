const tsconfig = require('./tsconfig.json');

const getAliasPaths = () => {
  const trimPath = (path) =>
    path.endsWith('/*') ? path.substr(0, path.length - 2) : path;

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
      ['module-resolver', { alias: getAliasPaths() }],
      [
        'formatjs',
        // {
        //   idInterpolationPattern: '[sha512:contenthash:base64:6]',
        //   ast: true,
        // },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
