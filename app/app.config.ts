import { ExpoConfig, ConfigContext } from "@expo/config";

// Cannot use import statement outside a module
const { CONFIG } = require("lib/config");

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name || "",
  slug: config.slug || "",
  extra: CONFIG,
});
