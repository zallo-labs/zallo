import { Chain, isChain } from 'chains';
import { Address, asUAddress, ETH_ADDRESS } from '../address';
import { Hex } from '../bytes';
import { isPresent } from '../util/arrays';
import { addressMap } from './util';

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address: Partial<Record<Chain, Address>>;
  ethereumAddress: Address;
  units?: { symbol: string; decimals: number }[];
  iconUri?: string;
  isFeeToken?: boolean;
  pythUsdPriceId?: Hex;
}

export const ETH = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
  address: addressMap({
    zksync: ETH_ADDRESS,
    'zksync-goerli': ETH_ADDRESS,
  }),
  ethereumAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  iconUri:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  units: [
    { symbol: 'WEI', decimals: 0 },
    { symbol: 'GWEI', decimals: 9 },
  ],
  isFeeToken: true,
  pythUsdPriceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
} satisfies Token;

export const WETH = {
  name: 'Wrapped ETH',
  symbol: 'wETH',
  decimals: 18,
  address: addressMap({
    zksync: '0xf00DAD97284D0c6F06dc4Db3c32454D4292c6813',
    'zksync-goerli': '0x20b28B1e4665FFf290650586ad76E977EAb90c5D',
  }),
  ethereumAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  iconUri:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  isFeeToken: true,
  pythUsdPriceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
} satisfies Token;

export const USDC = {
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  address: addressMap({
    zksync: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
    'zksync-goerli': '0x0faF6df7054946141266420b43783387A78d82A9',
  }),
  ethereumAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDC.svg',
  isFeeToken: true,
  pythUsdPriceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
} satisfies Token;

export const DAI = {
  name: 'Dai',
  symbol: 'DAI',
  decimals: 18,
  address: addressMap({
    zksync: '0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656',
    'zksync-goerli': '0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b',
  }),
  ethereumAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg',
  isFeeToken: true,
  pythUsdPriceId: '0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd',
} satisfies Token;

export const USDT = {
  name: 'Tether USD',
  symbol: 'USDT',
  decimals: 6,
  address: addressMap({
    zksync: '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C',
    'zksync-goerli': '0xfcEd12dEbc831D3a84931c63687C395837D42c2B',
  }),
  ethereumAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
  pythUsdPriceId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
} satisfies Token;

export const WBTC = {
  name: 'Wrapped Bitcoin',
  symbol: 'wBTC',
  decimals: 8,
  address: addressMap({
    zksync: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
    'zksync-goerli': '0x0BfcE1D53451B4a8175DD94e6e029F7d8a701e9c',
  }),
  ethereumAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  iconUri: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
  pythUsdPriceId: '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
} satisfies Token;

export const RETH = {
  name: 'Rocket Pool ETH',
  symbol: 'rETH',
  decimals: 18,
  address: addressMap({
    zksync: '0x32Fd44bB869620C0EF993754c8a00Be67C464806',
  }),
  ethereumAddress: '0xae78736Cd615f374D3085123A210448E74Fc6393',
  iconUri: 'https://assets.coingecko.com/coins/images/20764/large/reth.png',
  isFeeToken: true,
  pythUsdPriceId: '0xa0255134973f4fdf2f8f7808354274a3b1ebc6ee438be898d045e8b56ba1fe13',
} satisfies Token;

export const CBETH = {
  name: 'Coinbase Wrapped Staken ETH',
  symbol: 'cbETH',
  decimals: 18,
  address: addressMap({
    zksync: '0x75Af292c1c9a37b3EA2E6041168B4E48875b9ED5',
  }),
  ethereumAddress: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
  iconUri: 'https://assets.coingecko.com/coins/images/27008/large/cbeth.png',
  isFeeToken: true,
  pythUsdPriceId: '0x15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce5717',
} satisfies Token;

export const TOKENS = [ETH, WETH, USDC, DAI, USDC, WBTC, RETH, CBETH] satisfies Token[];

export function flattenToken(t: Token) {
  return Object.keys(t.address)
    .map((chain) => {
      if (!isChain(chain)) throw new Error(`Unexpected token address map chain ${chain}`);
      const address = asUAddress(t.address[chain], chain);
      if (!address) return undefined;

      return { ...t, address };
    })
    .filter(isPresent);
}
