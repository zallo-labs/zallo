import { ETH, WETH } from '@token/tokens';
import { Address } from 'lib';

export const normalizeSyncswapToken = (token: Address) =>
  token === ETH.address ? WETH.address : token;
