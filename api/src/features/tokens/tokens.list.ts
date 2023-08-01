import { InsertShape } from '~/edgeql-js/insert';
import { $Token } from '~/edgeql-js/modules/default';

export const WETH = {
  name: 'Wrapped ETH',
  symbol: 'wETH',
  decimals: 18,
  address: '0x20b28B1e4665FFf290650586ad76E977EAb90c5D',
  ethereumAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  iconUri:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  isFeeToken: true,
};

export const TOKENS = [
  {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    ethereumAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    iconUri:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    units: [
      { symbol: 'WEI', decimals: 0 },
      { symbol: 'GWEI', decimals: 9 },
    ],
    isFeeToken: true,
  },
  WETH,
  {
    name: 'Dai',
    symbol: 'DAI',
    decimals: 18,
    address: '0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b',
    ethereumAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg',
    isFeeToken: true,
  },
  {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: '0x0faF6df7054946141266420b43783387A78d82A9',
    ethereumAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDC.svg',
    isFeeToken: true,
  },
  {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    address: '0xfcEd12dEbc831D3a84931c63687C395837D42c2B',
    ethereumAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
    isFeeToken: true,
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
    ethereumAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    iconUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
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
    ethereumAddress: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    iconUri: 'https://cryptologos.cc/logos/frax-frax-logo.svg',
  },
] satisfies InsertShape<$Token>[];
