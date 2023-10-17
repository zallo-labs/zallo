import constants from 'expo-constants';
import type { Config } from '../../app.config';
import { Href } from 'expo-router';
import { resolveHref } from 'expo-router/src/link/href';

export const CONFIG = constants.expoConfig!.extra as Config;

export const SCHEME = Array.isArray(constants.expoConfig?.scheme)
  ? constants.expoConfig?.scheme[0]
  : constants.expoConfig?.scheme;

export const getDeepLink = <T>(href: Href<T>) => {
  return `${SCHEME}:/${resolveHref(href)}`;
};

const PATTERN = new RegExp(`^${SCHEME}://[/]?(.+)$`);
export const getPathFromDeepLink = (link: string) => {
  const path = link.match(PATTERN)?.[1];
  return path && `/${path}`;
};
