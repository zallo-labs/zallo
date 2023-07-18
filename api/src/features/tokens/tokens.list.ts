import { Token } from '~/edgeql-interfaces';

export const TOKENS: Omit<Token, 'id' | 'user'>[] = [
  {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    ethereumAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    iconUri:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    units: [
      { symbol: 'WEI', decimals: 1 },
      { symbol: 'GWEI', decimals: 9 },
    ],
  },
  {
    name: 'Wrapped ETH',
    symbol: 'wETH',
    decimals: 18,
    address: '0x20b28b1e4665fff290650586ad76e977eab90c5d',
    ethereumAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    iconUri:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  },
  {
    name: 'Dai',
    symbol: 'DAI',
    decimals: 18,
    address: '0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b',
    ethereumAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg',
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0x0faF6df7054946141266420b43783387A78d82A9',
    ethereumAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDC.svg',
  },
  {
    name: 'Wrapped Bitcoin',
    symbol: 'wBTC',
    decimals: 8,
    address: '0x0BfcE1D53451B4a8175DD94e6e029F7d8a701e9c',
    ethereumAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    iconUri: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
  },
  {
    name: 'ChainLink',
    symbol: 'LINK',
    decimals: 18,
    address: '0x40609141Db628BeEE3BfAB8034Fc2D8278D0Cc78',
    ethereumAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
    iconUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
  },
  {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    address: '0xfcEd12dEbc831D3a84931c63687C395837D42c2B',
    ethereumAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
  },
  {
    name: 'Curve DAO',
    symbol: 'CRV',
    decimals: 18,
    address: '0x0C7811ba1CE9f63246bAcD97847f9D5a987e421B',
    ethereumAddress: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    iconUri: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg',
  },
  {
    name: 'Frax',
    symbol: 'FRAX',
    decimals: 18,
    address: '0xB4fbFB7807C31268Dc1ac8c26fA4ef41115d0ece',
    ethereumAddress: '0x853d955acef822db058eb8505911ed77f175b99e',
    iconUri: 'https://cryptologos.cc/logos/frax-frax-logo.svg',
  },
  {
    name: 'Aave',
    symbol: 'AAVE',
    decimals: 18,
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    ethereumAddress: '0x853d955acef822db058eb8505911ed77f175b99e',
    iconUri: 'https://cryptologos.cc/logos/aave-aave-logo.svg',
  },
];
