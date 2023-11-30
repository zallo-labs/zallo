import { Chain } from 'chains';
import { Address, ETH_ADDRESS } from 'lib';

interface TokenDef {
  name: string;
  symbol: string;
  decimals: number;
  address: Partial<Record<Chain, Address>>;
  ethereumAddress: Address;
  units?: { symbol: string; decimals: number }[];
  iconUri?: string;
  isFeeToken?: boolean;
}

export const WETH = {
  name: 'Wrapped ETH',
  symbol: 'wETH',
  decimals: 18,
  address: {
    zksync: '0xf00DAD97284D0c6F06dc4Db3c32454D4292c6813',
    'zksync-goerli': '0x20b28B1e4665FFf290650586ad76E977EAb90c5D',
  },
  ethereumAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  iconUri:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  isFeeToken: true,
} satisfies TokenDef;

export const TOKENS = [
  {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    address: {
      zksync: ETH_ADDRESS,
      'zksync-goerli': ETH_ADDRESS,
    },
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
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    address: {
      zksync: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
      'zksync-goerli': '0x0faF6df7054946141266420b43783387A78d82A9',
    },
    ethereumAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDC.svg',
    isFeeToken: true,
  },
  {
    name: 'Dai',
    symbol: 'DAI',
    decimals: 18,
    address: {
      zksync: '0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656',
      'zksync-goerli': '0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b',
    },
    ethereumAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg',
    isFeeToken: true,
  },
  {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    address: {
      zksync: '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C',
      'zksync-goerli': '0xfcEd12dEbc831D3a84931c63687C395837D42c2B',
    },
    ethereumAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    iconUri:
      'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
    isFeeToken: true,
  },
  {
    name: 'Wrapped Bitcoin',
    symbol: 'wBTC',
    decimals: 8,
    address: {
      zksync: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
      'zksync-goerli': '0x0BfcE1D53451B4a8175DD94e6e029F7d8a701e9c',
    },
    ethereumAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    iconUri: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
  },
  {
    name: 'Rocket Pool ETH',
    symbol: 'rETH',
    decimals: 18,
    address: {
      zksync: '0x32Fd44bB869620C0EF993754c8a00Be67C464806',
    },
    ethereumAddress: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    iconUri: 'https://assets.coingecko.com/coins/images/20764/large/reth.png',
  },
  {
    name: 'Coinbase Wrapped Staken ETH',
    symbol: 'cbETH',
    decimals: 18,
    address: {
      zksync: '0x75Af292c1c9a37b3EA2E6041168B4E48875b9ED5',
    },
    ethereumAddress: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    iconUri: 'https://assets.coingecko.com/coins/images/27008/large/cbeth.png',
  },
] satisfies TokenDef[];
