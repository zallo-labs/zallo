import constants from 'expo-constants';
import type { Config } from '../../app.config';

export const CONFIG = constants.expoConfig!.extra as Config;

export const SCHEME = Array.isArray(constants.expoConfig?.scheme)
  ? constants.expoConfig?.scheme[0]
  : constants.expoConfig?.scheme;

export const makeDeepLink = (path: string) => {
  if (path.startsWith('/')) path = path.slice(1);

  return `${SCHEME}://${path}`;
};

const PATTERN = new RegExp(`^${SCHEME}://[/]?(.+)$`);
export const getPathFromDeepLink = (link: string) => {
  const path = link.match(PATTERN)?.[1];
  return path && `/${path}`;
};
