import { Image } from 'expo-image';
import { Address } from 'lib';
import * as zk from 'zksync-web3';
import { asToken, Token } from './token';

export const ETH = asToken({
  type: 'Native',
  name: 'Ether',
  // symbol: 'Ξ',
  symbol: 'ETH',
  decimals: 18,
  units: [
    { symbol: 'WEI', decimals: 1 },
    { symbol: 'GWEI', decimals: 9 },
  ],
  addresses: {
    ethereum: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // wETH
    testnet: zk.utils.ETH_ADDRESS,
  },
  iconUri:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
});

export const WETH = asToken({
  name: 'Wrapped ETH',
  symbol: 'wETH',
  decimals: 18,
  units: ETH.units.map((unit) => ({ ...unit, symbol: `w${unit.symbol}` })),
  addresses: {
    ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    mainnet: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
    testnet: '0x20b28b1e4665fff290650586ad76e977eab90c5d',
  },
  iconUri:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
});

export const DAI = asToken({
  name: 'Dai',
  symbol: 'DAI',
  decimals: 18,
  addresses: {
    ethereum: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
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
    ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
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
    ethereum: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    testnet: '0x0BfcE1D53451B4a8175DD94e6e029F7d8a701e9c',
  },
  iconUri: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
});

export const LINK = asToken({
  name: 'ChainLink',
  symbol: 'LINK',
  decimals: 18,
  addresses: {
    ethereum: '0x514910771af9ca656af840dff83e8264ecf986ca',
    testnet: '0x40609141Db628BeEE3BfAB8034Fc2D8278D0Cc78',
  },
  iconUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
});

export const USDT = asToken({
  name: 'Tether USD',
  symbol: 'USDT',
  decimals: 6,
  addresses: {
    ethereum: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    testnet: '0xfcEd12dEbc831D3a84931c63687C395837D42c2B',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
});

export const CURVE = asToken({
  name: 'Curve DAO',
  symbol: 'CRV',
  decimals: 18,
  addresses: {
    ethereum: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    testnet: '0x0C7811ba1CE9f63246bAcD97847f9D5a987e421B',
  },
  iconUri: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg',
});

export const FRAX = asToken({
  name: 'Frax',
  symbol: 'FRAX',
  decimals: 18,
  addresses: {
    ethereum: '0x853d955acef822db058eb8505911ed77f175b99e',
    testnet: '0xB4fbFB7807C31268Dc1ac8c26fA4ef41115d0ece',
  },
  iconUri: 'https://cryptologos.cc/logos/frax-frax-logo.svg',
});

export const AAVE = asToken({
  name: 'Aave',
  symbol: 'AAVE',
  decimals: 18,
  addresses: {
    ethereum: '0x853d955acef822db058eb8505911ed77f175b99e',
    testnet: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  },
  iconUri: 'https://cryptologos.cc/logos/aave-aave-logo.svg',
});

export const HARDCODED_TOKENS = new Map<Address, Token>(
  [ETH, WETH, DAI, USDC, WBTC, LINK, USDT, CURVE, FRAX, AAVE].map((t) => [t.address, t]),
);
Image.prefetch([...HARDCODED_TOKENS.values()].map((t) => t.iconUri));
