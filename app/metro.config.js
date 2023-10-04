const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const findWorkspaceRoot = require('find-yarn-workspace-root');
const getSymlinkedNodeModulesForDirectory = require('expo-yarn-workspaces/common/get-symlinked-modules');

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

config.watcher.healthCheck = { enabled: true };

/* Monorepo */
// 1. Watch all files within the monorepo
config.projectRoot = __dirname;
const workspaceRoot = findWorkspaceRoot(config.projectRoot);
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(config.projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// config.resolver.extraNodeModules = {
//   ...config.resolver.extraNodeModules,
//   ...getSymlinkedNodeModulesForDirectory(workspaceRoot),
//   ...getSymlinkedNodeModulesForDirectory(config.projectRoot),
// };

// Symlinks
// config.resolver.unstable_enableSymlinks = true;

// SVG imports (react-native-svg-transformer)
config.resolver.assetExts.filter((e) => e !== 'svg');
config.resolver.sourceExts.push('svg');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// node-libs-react-native
// config.resolver.extraNodeModules = {
//   ...config.resolver.extraNodeModules,
//   ...require('node-libs-react-native'),
// };

module.exports = config;
