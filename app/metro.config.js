const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const findWorkspaceRoot = require('find-yarn-workspace-root');

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

config.resolver.sourceExts.push('css');

config.watcher.healthCheck = { enabled: true };

/* Monorepo */
// 1. Watch all files within the monorepo
const projectRoot = __dirname;
const workspaceRoot = findWorkspaceRoot(projectRoot);
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Symlinks
config.resolver.unstable_enableSymlinks = true;

// SVG imports (react-native-svg-transformer)
config.resolver.assetExts.filter((e) => e !== 'svg');
config.resolver.sourceExts.push('svg');
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// node-libs-react-native
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...require('node-libs-react-native'),
};

module.exports = config;
