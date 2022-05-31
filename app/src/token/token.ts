import { address, Address, Addresslike } from 'lib';
import _ from 'lodash';
import { CHAIN } from '~/provider';

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  addr: Address; // Current chain address
  addresses: Partial<Record<'mainnet' | 'testnet', Address>>;
  iconUri: string;
}

type TokenDef = Pick<Token, 'name' | 'symbol' | 'decimals'> & {
  addresses: Partial<Record<'mainnet' | 'testnet', Addresslike>>;
  iconUri?: string;
};

export const HARDCODED_TOKENS: Token[] = [];

export const createToken = (def: TokenDef): Token => {
  const addresses = _.mapValues(def.addresses, address);
  const addr = address(def.addresses[CHAIN.name]);

  const token: Token = {
    ...def,
    addr,
    addresses,
    iconUri:
      def.iconUri ??
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${def.addresses.mainnet}/logo.png`,
  };

  if (addr) HARDCODED_TOKENS.push(token);

  return token;
};
