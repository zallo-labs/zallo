import * as zk from 'zksync-web3';
import { createToken as token } from './token';

export const ETH = token({
  name: 'Ether',
  symbol: 'Ξ',
  decimals: 18,
  addresses: {
    mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // wETH
    testnet: zk.utils.ETH_ADDRESS,
  },
  iconUri:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  // 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
});

export const DAI = token({
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

export const USDC = token({
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

export const WBTC = token({
  name: 'Wrapped Bitcoin',
  symbol: 'wBTC',
  decimals: 8,
  addresses: {
    mainnet: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    testnet: '0xCA063A2AB07491eE991dCecb456D1265f842b568',
  },
});

export const LINK = token({
  name: 'ChainLink',
  symbol: 'LINK',
  decimals: 18,
  addresses: {
    mainnet: '0x514910771af9ca656af840dff83e8264ecf986ca',
    testnet: '0x63bfb2118771bd0da7A6936667A7BB705A06c1bA',
  },
  iconUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
});

export const USDT = token({
  name: 'Tether USD',
  symbol: 'USDT',
  decimals: 6,
  addresses: {
    mainnet: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    testnet: '0x509Ee0d083DdF8AC028f2a56731412edD63223B9',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
});
