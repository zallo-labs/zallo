// https://eips.ethereum.org/EIPS/eip-681
// https://github.com/brunobar79/eth-url-parser
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { parse, build } from 'eth-url-parser';
import { Address } from 'lib';
import { PROVIDER } from '~/provider';

export interface AddrLink {
  scheme: string;
  target_address: Address;
  chain_id?: number;
  parameters?: Record<string, string>;
}

const getDefaults = (): Partial<AddrLink> => ({
  scheme: 'ethereum',
  chain_id: PROVIDER.network.chainId,
});

export type BuildAddrLinkOptions = Pick<AddrLink, 'target_address'> &
  Partial<AddrLink>;

export const buildAddrLink = (options: BuildAddrLinkOptions): string =>
  build({
    ...getDefaults(),
    ...options,
  });

export const parseAddrLink = (link: string): AddrLink => ({
  ...getDefaults(),
  ...parse(link),
});
