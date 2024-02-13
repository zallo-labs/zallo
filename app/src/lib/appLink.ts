import { Href } from 'expo-router';
import { resolveHref } from 'expo-router/build/link/href';
import _ from 'lodash';
import { SCHEME, CONFIG } from '../util/config';

export function appLink<T>(href: Href<T>, type: 'native' | 'universal' = 'universal') {
  const path = resolveHref(href);

  return type === 'native' ? `${SCHEME}:/${path}` : `${CONFIG.webAppUrl}${path}`;
}
const SCHEME_PREFIX = `(?:${SCHEME}:/)`;
const UNIVERSAL_PREFIX = `(?:${_.escapeRegExp(CONFIG.webAppUrl)})`;
const APP_LINK_REGEX = new RegExp(`^(?:${SCHEME_PREFIX}|${UNIVERSAL_PREFIX})(/.+)$`);

export const parseAppLink = (appLink: string) => {
  const href = appLink.match(APP_LINK_REGEX)?.[1];
  if (!href) return undefined;

  const url = new URL(`${CONFIG.webAppUrl}${href}`);

  return {
    pathname: url.pathname,
    params: Object.fromEntries(url.searchParams),
  } as unknown as Href<string>;
};
