// https://eips.ethereum.org/EIPS/eip-681
// https://github.com/brunobar79/eth-url-parser
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { parse, build } from 'eth-url-parser';
import { BigNumberish } from 'ethers';
import { Address } from 'lib';
import { CHAIN_ID } from '~/provider';
import { Token } from '~/token/token';
import { ETH } from '~/token/tokens';

export interface AddrLink {
  scheme: string;
  prefix?: string;
  target_address: Address;
  chain_id?: number;
  function_name?: string;
  parameters: {
    value?: BigNumberish;
    gas?: BigNumberish;
    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;
  } & Record<string, string>;
}

const getDefaults = () => ({
  scheme: 'ethereum',
  chain_id: CHAIN_ID,
  parameters: {},
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

export const buildTransferLink = (
  options: BuildAddrLinkOptions,
  token: Token,
  amount: BigNumberish,
): string => {
  const opts: AddrLink = {
    ...getDefaults(),
    ...options,
  };

  opts.parameters.value = amount.toString();
  if (token !== ETH) {
    opts.function_name = 'transfer';
    opts.target_address = token.addr;
    opts.parameters.to = options.target_address;
  }

  return build(opts);
};
