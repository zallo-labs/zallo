import { atom, useAtomValue } from 'jotai';
import { estimateSwap } from './swap';
import { EstimateSwapParams } from './types';
import deepEqual from 'fast-deep-equal';
import { atomFamily } from 'jotai/utils';

const estimateFamily = atomFamily(
  (params: EstimateSwapParams) => atom(params && estimateSwap(params)),
  deepEqual,
);

export const useEstimatedSwap = (params: EstimateSwapParams) =>
  useAtomValue(estimateFamily(params));
