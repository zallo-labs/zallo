import constants from 'expo-constants';
import { filterFirst } from 'lib';
import type { Config } from '../../app.config';

// https://docs.expo.dev/eas-update/environment-variables/
const buildManifest = constants.manifest;
const updateManifest = constants.manifest2?.extra?.expoClient;

// Merge extras, preferring update extras
const extraEntries = filterFirst(
  [...Object.entries(updateManifest?.extra ?? {}), ...Object.entries(buildManifest?.extra ?? {})],
  ([key]) => key,
);

export const CONFIG = Object.fromEntries(extraEntries) as Config;

export const IS_DEV = CONFIG.env === 'development';

export const SPLASH = updateManifest?.splash ?? buildManifest?.splash;
