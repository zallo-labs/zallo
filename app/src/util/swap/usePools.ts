import { atom, useAtomValue } from 'jotai';
import { getPools } from './syncswap/pools';
import { atomFamily } from 'jotai/utils';
import { Address } from 'lib';
import deepEqual from 'fast-deep-equal';

const poolsFamily = atomFamily((tokens: Address[]) => atom(getPools(tokens)), deepEqual);

export const useSwapPools = (from: Address, tokens: Address[]) => {
  const allPools = useAtomValue(poolsFamily(tokens));

  return allPools.filter((p) => p.pair.includes(from));
};
