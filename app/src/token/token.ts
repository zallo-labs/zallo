import { BigNumber } from 'ethers';
import {
  address,
  Address,
  Addresslike,
  createTx,
  Erc20,
  Erc20__factory,
  TxReq,
} from 'lib';
import _ from 'lodash';
import { CHAIN, PROVIDER } from '~/provider';

export type TokenType = 'ETH' | 'ERC20';

export interface Token {
  type: TokenType;
  name: string;
  symbol: string;
  decimals: number;
  addr: Address; // Current chain address
  addresses: Partial<Record<'mainnet' | 'testnet', Address>>;
  iconUri: string;
}

type TokenDef = Pick<Token, 'name' | 'symbol' | 'decimals'> & {
  type?: TokenType;
  addresses: Partial<Record<'mainnet' | 'testnet', Addresslike>>;
  iconUri?: string;
};

export const createToken = (def: TokenDef): Token => {
  const addresses = _.mapValues(def.addresses, address);

  if (CHAIN.name !== 'testnet') throw new Error('Only testnet is supported');
  const addr = def.addresses[CHAIN.name];
  if (!addr) throw new Error('Address not found');

  const token: Token = {
    type: 'ERC20',
    ...def,
    addr: address(addr),
    addresses,
    iconUri:
      def.iconUri ??
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${def.addresses.mainnet}/logo.png`,
  };

  return token;
};

export const ERC20_INTERFACE = Erc20__factory.createInterface();

export const getTokenContract = (token: Token): Erc20 =>
  Erc20__factory.connect(token.addr, PROVIDER);

export const createTransferTx = (
  token: Token,
  to: Address,
  amount: BigNumber,
): TxReq =>
  createTx(
    token.type === 'ERC20'
      ? {
          // ERC20
          to: token.addr,
          data: getTokenContract(token).interface.encodeFunctionData(
            'transfer',
            [to, amount],
          ),
        }
      : {
          // ETH
          to,
          value: amount,
        },
  );

export const convertTokenAmount = (
  amount: BigNumber,
  prevToken: Token,
  newToken: Token,
): BigNumber => {
  const decimalsDiff = prevToken.decimals - newToken.decimals;
  if (decimalsDiff === 0) return amount;

  const div = BigNumber.from(10).pow(Math.abs(decimalsDiff));

  return decimalsDiff >= 0 ? amount.div(div) : amount.mul(div);
};
