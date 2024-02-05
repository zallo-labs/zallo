import constants from 'expo-constants';
import type { Config } from '../../app.config';
import { Href } from 'expo-router';
import { resolveHref } from 'expo-router/build/link/href';
import { Platform } from 'react-native';
import _ from 'lodash';

export const CONFIG = constants.expoConfig!.extra as Config;

export const SCHEME = Array.isArray(constants.expoConfig?.scheme)
  ? constants.expoConfig?.scheme[0]
  : constants.expoConfig?.scheme;

export function appLink<T>(href: Href<T>, type: 'native' | 'universal' = 'universal') {
  const path = resolveHref(href);

  return type === 'native' ? `${SCHEME}:/${path}` : `${CONFIG.webAppUrl}/${path}`;
}

const SCHEME_PREFIX = `(?:${SCHEME}:/)`;
const UNIVERSAL_PREFIX = `(?:${_.escapeRegExp(CONFIG.webAppUrl)})`;
const APP_LINK_REGEX = new RegExp(`^(?:${SCHEME_PREFIX}|${UNIVERSAL_PREFIX})(/.+)$`);

export const parseAppLink = (appLink: string) => {
  const path = appLink.match(APP_LINK_REGEX)?.[1];
  return path && `/${path}`;
};

export const __WEB__ = Platform.OS === 'web';
