import { z } from 'zod';

const URI_PATTERN = /^wc:[0-9a-f]{64}@2\?/;

export function isWalletConnectUri(uri: string): uri is `wc:${string}` {
  return URI_PATTERN.test(uri);
}

export function zWalletConnectUri() {
  return z.string().refine(isWalletConnectUri);
}
