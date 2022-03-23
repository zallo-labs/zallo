// https://docs.expo.io/guides/customizing-metro
// https://facebook.github.io/metro/docs/configuration/
const { getDefaultConfig } = require("expo/metro-config");
const findWorkspaceRoot = require("find-yarn-workspace-root");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = findWorkspaceRoot(projectRoot);

const workspaceNodeModules = path.resolve(workspaceRoot, "node_modules");
const lib = path.resolve(workspaceRoot, "lib");

const config = getDefaultConfig(projectRoot);

// // 1. Watch all files within the monorepo
// config.watchFolders = [projectRoot, workspaceNodeModules, lib];

// // 2. Let Metro know where to resolve packages, and in what order
// config.resolver.nodeModulesPaths = [lib, workspaceNodeModules, `${projectRoot}/node_modules`];

// 1. Watch all files within the monorepo
config.watchFolders = [projectRoot, workspaceRoot];

// 2. Let Metro know where to resolve packages, and in what order
config.resolver.nodeModulesPaths = [lib, workspaceNodeModules, `${projectRoot}/node_modules`];

module.exports = config;
