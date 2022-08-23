import * as zk from 'zksync-web3';
import { createToken, Token } from './token';

export const HARDCODED_TOKENS: Token[] = [];

const token = (...args: Parameters<typeof createToken>) => {
  const token = createToken(...args);
  if (token.addr) HARDCODED_TOKENS.push(token);
  return token;
};

export const ETH = token({
  type: 'ETH',
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
    testnet: '0xE9f4149276E8a4F8DB89E0E3bb78fD853F01e87D',
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
    testnet: '0x54a14D7559BAF2C8e8Fa504E019d32479739018c',
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
    testnet: '0x98DDd69B2443Fc67755f0901aEb9828a8A62cc65',
  },
});

export const LINK = token({
  name: 'ChainLink',
  symbol: 'LINK',
  decimals: 18,
  addresses: {
    mainnet: '0x514910771af9ca656af840dff83e8264ecf986ca',
    testnet: '0x4732C03B2CF6eDe46500e799DE79a15Df44929eB',
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
