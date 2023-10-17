import { Sitemap as InternalSitemap } from 'expo-router/src/views/Sitemap';

/**
 * Sitemap is enabled unless explicitly disabled
 * https://docs.expo.dev/router/reference/sitemap/
 */
export default function Sitemap() {
  return __DEV__ ? <InternalSitemap /> : null;
}
