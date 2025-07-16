const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);

// 1. Path to your global polyfill
const polyfillPath = path.resolve(__dirname, "src/utils/globalPolyfill.ts");

// 2. Store the original getTransformOptions function
const originalGetTransformOptions =
  defaultConfig.transformer.getTransformOptions;

// 3. Prepend the polyfill to the entry points
defaultConfig.transformer.getTransformOptions = async () => {
  // Call the original function
  const baseOptions = await originalGetTransformOptions?.();
  const transformOptions =
    baseOptions?.transform ||
    defaultConfig.transformer.babelTransformerPath.transform;

  return {
    transform: {
      ...transformOptions,
      experimentalImportSupport:
        transformOptions?.experimentalImportSupport ?? false,
      inlineRequires: transformOptions?.inlineRequires ?? true,
    },
    preloadedModules: {
      ...(baseOptions?.preloadedModules || {}),
      // This will load the polyfill before any other module
      [polyfillPath]: true,
    },
  };
};

// 4. Add resolver configuration to handle React Native Web modules
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  alias: {
    ...(defaultConfig.resolver.alias || {}),
    "react-native-web": require.resolve("react-native-web"),
  },
  // Add platform extensions to handle web-specific files
  platforms: ["ios", "android", "native", "web"],
  // Ensure proper resolution of React Native Web exports
  resolverMainFields: ["react-native", "browser", "main"],
  // Add additional extensions for better module resolution
  extensions: [".web.js", ".web.ts", ".web.tsx", ".js", ".ts", ".tsx", ".json"],
};

module.exports = defaultConfig;
