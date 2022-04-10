const { createWebpackConfigAsync } = require('expo-yarn-workspaces/webpack');
const { path } = require('fs');

module.exports = async function (env, argv) {
  const defaultConfig = await createWebpackConfigAsync(env, argv);
  return {
    ...defaultConfig,
    include: [
      ...defaultConfig.include,
      path.join(__dirname, 'node_modules/react-intl'),
      path.join(__dirname, 'node_modules/intl-messageformat'),
      path.join(__dirname, 'node_modules/@formatjs/icu-messageformat-parser'),
    ],
  };
};
