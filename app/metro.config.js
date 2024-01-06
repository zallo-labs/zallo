// https://facebook.github.io/metro/docs/configuration/
const { getDefaultConfig } = require('expo/metro-config');
const findWorkspaceRoot = require('find-yarn-workspace-root');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
const workspaceRoot = findWorkspaceRoot(projectRoot);
config.watchFolders = [workspaceRoot]; // Metro will only resolve projectRoot and watchFolders

// Force resolving nested modules from nodeModulesPath and extraNodeModules
config.resolver.disableHierarchicalLookup = true;

// Let Metro know where to resolve packages (in order of preference)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// const getSymlinkedNodeModulesForDirectory = require('expo-yarn-workspaces/common/get-symlinked-modules');
// config.resolver.extraNodeModules = {
//   ...config.resolver.extraNodeModules,
//   ...getSymlinkedNodeModulesForDirectory(workspaceRoot),
//   ...getSymlinkedNodeModulesForDirectory(config.projectRoot),
// };

config.resolver.sourceExts.push('cjs', 'mjs');

// node-libs-react-native
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...require('node-libs-react-native'),
};

module.exports = config;
