const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const shims = {
    "framer-motion": "./src/shims/framer-motion.ts",
    "posthog-react-native": "./src/shims/posthog-react-native.ts",
  };
  if (shims[moduleName]) {
    return {
      filePath: path.resolve(__dirname, shims[moduleName]),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
