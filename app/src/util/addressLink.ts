// https://eips.ethereum.org/EIPS/eip-681
// https://github.com/brunobar79/eth-url-parser
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { parse, build } from 'eth-url-parser';
import { Address, tryOrIgnore } from 'lib';
import { CHAIN } from '~/util/network/provider';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

export interface AddressLink {
  scheme: string;
  prefix?: string;
  target_address: Address;
  chain_id?: number;
  function_name?: string;
  parameters: {
    value?: string;
    gas?: string;
    gasLimit?: string;
    gasPrice?: string;
    // TYPE
    address?: Address;
    uint256?: string;
  } & Record<string, string>;
}

const getDefaults = () => ({
  scheme: 'ethereum',
  chain_id: CHAIN.id,
  parameters: {},
});

export const parseAddressLink = (link: string) =>
  tryOrIgnore((): AddressLink => ({ ...getDefaults(), ...parse(link) }));

export type AddressLinkOptions = Pick<AddressLink, 'target_address'> & Partial<AddressLink>;

type TransferRequestLinkOptions = Omit<AddressLinkOptions, 'function_name'> & {
  token: Address;
  amount: bigint;
};

export type BuildAddressLinkOptions = AddressLinkOptions | TransferRequestLinkOptions | Address;

const isTransferRequestOptions = (o: BuildAddressLinkOptions): o is TransferRequestLinkOptions =>
  typeof o === 'object' && 'token' in o;

export const buildAddressLink = (o: BuildAddressLinkOptions) => {
  const link: AddressLink = {
    ...getDefaults(),
    ...(typeof o === 'object' ? o : { target_address: o }),
  };

  if (isTransferRequestOptions(o)) {
    if (o.token === ETH_ADDRESS) {
      link.parameters.value = o.amount.toString();
    } else {
      link.function_name = 'transfer';
      const to = link.target_address;
      link.target_address = o.token;
      link.parameters.address = to;
      link.parameters.uint256 = o.amount.toString();
    }
  }

  return build(link);
};
