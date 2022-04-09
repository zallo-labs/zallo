import { getErc20Contract } from './erc20';
import { Token } from './token';

const create = (token: Omit<Token, 'getBalance'>): Token => {
  const contract = getErc20Contract(token.addr);

  return {
    ...token,
    getBalance: (safe) => contract.balanceOf(safe.address),
  };
};

export const ETH: Token = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
  addr: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  getBalance: (safe) => safe.provider.getBalance(safe.address),
};

export const DAI = create({
  name: 'Dai',
  symbol: 'DAI',
  decimals: 18,
  addr: '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
});

export const USDC = create({
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  addr: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
});

export const USDT = create({
  name: 'Tether USD',
  symbol: 'USDT',
  decimals: 6,
  addr: '0x110a13FC3efE6A245B50102D2d79B3E76125Ae83',
  // iconUri: 'https://etherscan.io/token/images/tether_32.png',
  iconUri:
    'https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_USDT.svg',
  // 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
});

export const UNI = create({
  name: 'Uniswap',
  symbol: 'UNI',
  decimals: 18,
  addr: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
});

export const WBTC = create({
  name: 'Wrapped Bitcoin',
  symbol: 'WBTC',
  decimals: 8,
  addr: '0x442Be68395613bDCD19778e761f03261ec46C06D',
  iconUri:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
});

export const TOKENS: Token[] = [ETH, DAI, USDC, USDT, UNI, WBTC];
