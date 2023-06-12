import { EstimateSwapParams, GetSwapOperationsParams, Pool, TokenAmount } from './types';
import { match, P } from 'ts-pattern';
import { Operation } from 'lib';
import * as syncswap from './syncswap/swap';

const getType = (pool: Pool) =>
  match(pool)
    .with(P.union({ type: 'syncswap-classic' }, { type: 'syncswap-stable' }), () => syncswap)
    .exhaustive();

export const estimateSwap = (params: EstimateSwapParams): Promise<TokenAmount> =>
  getType(params.pool).estimateSwap(params);

export const getSwapOperations = (
  params: GetSwapOperationsParams,
): Promise<[Operation, ...Operation[]]> => getType(params.pool).getSwapOperations(params);
