const { createMetroConfiguration } = require('expo-yarn-workspaces');
const { getDefaultConfig } = require('metro-config');

let config = createMetroConfiguration(__dirname);

// Apollo client requires resolving .cjs files
// https://github.com/apollographql/apollo-client/blob/main/CHANGELOG.md#apollo-client-354-2021-11-19
const { resolver: defaultResolver } = getDefaultConfig.getDefaultValues();
config.resolver = {
  ...defaultResolver,
  sourceExts: [...defaultResolver.sourceExts, 'cjs'],
};

module.exports = config;
