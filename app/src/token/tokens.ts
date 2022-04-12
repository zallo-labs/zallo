import { CHAIN } from '@features/provider';
import { getErc20Contract } from './erc20';
import { Token } from './token';

const create = (token: Omit<Token, 'addr' | 'getBalance'>): Token => {
  const addr = token.addresses[CHAIN.name];
  const contract = getErc20Contract(addr);

  return {
    ...token,
    addr,
    getBalance: (safe) => contract.balanceOf(safe.address),
  };
};

export const WETH = create({
  name: 'Wrapped Ether',
  symbol: 'WETH',
  decimals: 18,
  addresses: {
    mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ropsten: '0xc778417e063141139fce010982780140aa0cd5ab',
  },
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  // 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/logo.png',
});

const ethAddresses = {
  mainnet: WETH.addresses.mainnet, // Assume the price is the same as WETH for fetching from Uniswap
  ropsten: '',
  // zkSync: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
};
export const ETH: Token = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
  addresses: ethAddresses,
  addr: ethAddresses[CHAIN.name],
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  getBalance: (safe) => safe.provider.getBalance(safe.address),
};

export const DAI = create({
  name: 'Dai',
  symbol: 'DAI',
  decimals: 18,
  addresses: {
    mainnet: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    ropsten: '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg',
  // 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
});

export const USDC = create({
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  addresses: {
    mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    ropsten: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDC.svg',
  // 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
});

export const USDT = create({
  name: 'Tether USD',
  symbol: 'USDT',
  decimals: 6,
  addresses: {
    mainnet: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    ropsten: '0x110a13FC3efE6A245B50102D2d79B3E76125Ae83',
  },
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
  // 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
  // 'https://etherscan.io/token/images/tether_32.png',
});

export const UNI = create({
  name: 'Uniswap',
  symbol: 'UNI',
  decimals: 18,
  addresses: {
    mainnet: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    ropsten: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  },
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
});

export const WBTC = create({
  name: 'Wrapped Bitcoin',
  symbol: 'WBTC',
  decimals: 8,
  addresses: {
    mainnet: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    ropsten: '0x442Be68395613bDCD19778e761f03261ec46C06D',
  },
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
});

export const TOKENS: Token[] = [ETH, DAI, USDC, USDT, UNI, WBTC, WETH];
