import { ExpoConfig, ConfigContext } from '@expo/config';

// No imports allow outside of a module
const { CONFIG } = require('config/dist/config');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name || '',
  slug: config.slug || '',
  extra: CONFIG,
});
