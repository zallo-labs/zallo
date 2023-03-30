import { Image } from 'expo-image';
import { Address } from 'lib';
import * as zk from 'zksync-web3';
import { asToken, Token } from './token';

export const ETH = asToken({
  type: 'ETH',
  name: 'Ether',
  // symbol: 'Ξ',
  symbol: 'ETH',
  decimals: 18,
  units: [
    { symbol: 'WEI', decimals: 1 },
    { symbol: 'GWEI', decimals: 9 },
  ],
  addresses: {
    mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // wETH
    testnet: zk.utils.ETH_ADDRESS,
  },
  iconUri:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
});

export const DAI = asToken({
  name: 'Dai',
  symbol: 'DAI',
  decimals: 18,
  addresses: {
    mainnet: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    testnet: '0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg',
});

export const USDC = asToken({
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  addresses: {
    mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    testnet: '0x0faF6df7054946141266420b43783387A78d82A9',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDC.svg',
});

export const WBTC = asToken({
  name: 'Wrapped Bitcoin',
  symbol: 'wBTC',
  decimals: 8,
  addresses: {
    mainnet: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    testnet: '0x0BfcE1D53451B4a8175DD94e6e029F7d8a701e9c',
  },
});

export const LINK = asToken({
  name: 'ChainLink',
  symbol: 'LINK',
  decimals: 18,
  addresses: {
    mainnet: '0x514910771af9ca656af840dff83e8264ecf986ca',
    testnet: '0x40609141Db628BeEE3BfAB8034Fc2D8278D0Cc78',
  },
  iconUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
});

export const USDT = asToken({
  name: 'Tether USD',
  symbol: 'USDT',
  decimals: 6,
  addresses: {
    mainnet: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    testnet: '0x22dc5D99a186b2b4092e917CB75C157A95bFfFf7',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
});

export const HARDCODED_TOKENS = new Map<Address, Token>(
  [ETH, DAI, USDC, WBTC, LINK, USDT].map((t) => [t.addr, t]),
);
Image.prefetch([...HARDCODED_TOKENS.values()].map((t) => t.iconUri));
