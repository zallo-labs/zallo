import { ETH, WETH } from '@token/tokens';
import { Address } from 'lib';

// SyncSwap's pools use WETH instead of ETH
// SyncSwap's router allows either WETH or ETH
export const normalizeSyncswapPoolToken = (token: Address) =>
  token === ETH.address ? WETH.address : token;
