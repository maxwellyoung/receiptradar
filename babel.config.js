module.exports = function (api) {
  api.cache(true);

  // Force JSC by setting environment variables
  process.env.EXPO_USE_HERMES = "false";
  process.env.RN_HERMES_ENABLED = "false";
  process.env.HERMES_ENABLED = "false";

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          useHermes: false,
        },
      ],
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@/components": "./src/components",
            "@/screens": "./src/screens",
            "@/hooks": "./src/hooks",
            "@/utils": "./src/utils",
            "@/types": "./src/types",
            "@/store": "./src/store",
            "@/services": "./src/services",
            "@/constants": "./src/constants",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
