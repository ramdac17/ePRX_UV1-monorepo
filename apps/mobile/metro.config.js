const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// --- NEW FIX: Force globals.js to run first ---
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [
    require.resolve(path.join(projectRoot, "globals.js")),
  ],
};
// ----------------------------------------------

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.transformer = {
  ...config.transformer,
  _expoRelativeProjectRoot: projectRoot,
};

config.resolver.resolverMainFields = [
  "react-native",
  "browser",
  "module",
  "main",
];

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
