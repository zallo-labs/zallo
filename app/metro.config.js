const { createMetroConfiguration } = require('expo-yarn-workspaces');

const conf = createMetroConfiguration(__dirname);

module.exports = {
  ...conf,
  resolver: {
    ...conf.resolver,
    assetExts: conf.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...conf.resolver.sourceExts, 'svg'],
    extraNodeModules: {
      ...conf.resolver.extraNodeModules,
      // https://www.npmjs.com/package/node-libs-react-native
      ...require('node-libs-react-native'),
    },
  },
  transformer: {
    ...conf.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};
