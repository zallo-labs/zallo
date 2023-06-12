import { useTokens } from '@token/useToken';
import { atom, useAtomValue } from 'jotai';
import { getPools } from './syncswap/pools';
import { atomFamily } from 'jotai/utils';
import { Address } from 'lib';
import deepEqual from 'fast-deep-equal';

const poolsFamily = atomFamily((tokens: Address[]) => atom(getPools(tokens)), deepEqual);

export const useSwapPools = () => {
  const tokens = useTokens().map((t) => t.address);

  return useAtomValue(poolsFamily(tokens));
};
