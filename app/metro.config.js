const { createMetroConfiguration } = require('expo-yarn-workspaces');

let config = createMetroConfiguration(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // https://www.npmjs.com/package/node-libs-react-native
  ...require('node-libs-react-native')
};

module.exports = config;
