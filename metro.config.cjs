const { getDefaultConfig } = require("expo/metro-config");

// Force environment variables to disable Hermes
process.env.EXPO_USE_HERMES = "false";
process.env.RN_HERMES_ENABLED = "false";
process.env.HERMES_ENABLED = "false";
process.env.USE_HERMES = "false";

const config = getDefaultConfig(__dirname);

// Explicitly disable Hermes
config.transformer = {
  ...config.transformer,
  hermesParser: false,
};

module.exports = config;
