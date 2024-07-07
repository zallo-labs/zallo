import { z } from 'zod';
import { CoreTypes } from '@walletconnect/types';
import { DappMetadataInput } from '~/api/__generated__/useProposeTransactionMutation.graphql';

const URI_PATTERN = /^wc:[0-9a-f]{64}@2\?/;

export function isWalletConnectUri(uri: string): uri is `wc:${string}` {
  return URI_PATTERN.test(uri);
}

export function zWalletConnectUri() {
  return z.string().refine(isWalletConnectUri);
}

export function asDapp(m: CoreTypes.Metadata): DappMetadataInput {
  return {
    name: m.name,
    url: asUrl(m.url).href,
    icons: m.icons.map(asUrl).map((u) => u.href),
  };
}

function asUrl(uri: string) {
  return new URL(uri.startsWith('http') ? uri : `https://${uri}`);
}
