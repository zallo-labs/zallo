import { Address } from 'lib';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

export const WETH_ADDRESSES = {
  mainnet: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
  testnet: '0x20b28B1e4665FFf290650586ad76E977EAb90c5D',
} as const;
export const WETH_ADDRESS = WETH_ADDRESSES.testnet; // mainnet TODO: chain specific address used

// SyncSwap's pools use WETH instead of ETH
// SyncSwap's router allows either WETH or ETH
export const normalizeSyncswapPoolToken = (token: Address) =>
  token === ETH_ADDRESS ? WETH_ADDRESS : token;
