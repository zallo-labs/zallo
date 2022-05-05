import { toAddress } from 'lib';
import * as zk from 'zksync-web3';
import { CHAIN } from '~/provider';
import { getErc20Contract } from './erc20';
import { Token } from './token';

export const TOKENS: Token[] = [];

type TokenDef = Omit<Token, 'addr' | 'contract' | 'iconUri'> &
  Partial<Pick<Token, 'iconUri'>>;

const create = (def: TokenDef): Token => {
  const addr = toAddress(def.addresses[CHAIN.name]);
  const contract = addr ? getErc20Contract(addr) : undefined;

  const token: Token = {
    ...def,
    addr,
    contract,
    iconUri:
      def.iconUri ??
      `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${def.addresses.mainnet}/logo.png`,
  };

  if (addr) TOKENS.push(token);

  return token;
};

export const ETH = create({
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
  addresses: {
    mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // wETH
    testnet: zk.utils.ETH_ADDRESS,
  },
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  // getBalance: (safe) => safe.provider.getBalance(safe.address),
});

export const DAI = create({
  name: 'Dai',
  symbol: 'DAI',
  decimals: 18,
  addresses: {
    mainnet: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    testnet: '0x5C221E77624690fff6dd741493D735a17716c26B',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg',
});

export const USDC = create({
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  addresses: {
    mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    testnet: '0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDC.svg',
});

export const WBTC = create({
  name: 'Wrapped Bitcoin',
  symbol: 'wBTC',
  decimals: 8,
  addresses: {
    mainnet: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    testnet: '0xCA063A2AB07491eE991dCecb456D1265f842b568',
  },
});

export const LINK = create({
  name: 'ChainLink',
  symbol: 'LINK',
  decimals: 18,
  addresses: {
    mainnet: '0x514910771af9ca656af840dff83e8264ecf986ca',
    testnet: '0x63bfb2118771bd0da7A6936667A7BB705A06c1bA',
  },
  iconUri:
    'https://www.dropbox.com/s/ssw8vtai9eaw4z0/LINK%20Token%20Icon%20White.svg?dl=0',
  // iconUri:
  //   'https://www.dropbox.com/s/6ly5r6aqp9bse7w/LINK%20Token%20Icon%20White.png?dl=0',
});

// export const USDT = create({
//   name: 'Tether USD',
//   symbol: 'USDT',
//   decimals: 6,
//   addresses: {
//     mainnet: '0xdac17f958d2ee523a2206206994597c13d831ec7',
//     ropsten: '0x110a13FC3efE6A245B50102D2d79B3E76125Ae83',
//   },
//   iconUri:
//     'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
//   // 'https://etherscan.io/token/images/tether_32.png',
// });

// export const UNI = create({
//   name: 'Uniswap',
//   symbol: 'UNI',
//   decimals: 18,
//   addresses: {
//     mainnet: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
//     ropsten: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
//   },
// });
