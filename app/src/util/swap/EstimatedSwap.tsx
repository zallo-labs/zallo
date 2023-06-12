import { atom, useAtomValue } from 'jotai';
import { estimateSwap } from './swap';
import { EstimateSwapParams } from './types';
import deepEqual from 'fast-deep-equal';
import { atomFamily } from 'jotai/utils';
import { TokenAmount } from '~/components/token/TokenAmount';

const estimateFamily = atomFamily(
  (params: EstimateSwapParams | undefined) => atom(params && estimateSwap(params)),
  deepEqual,
);

export const EstimatedSwap = (props: EstimateSwapParams) => {
  const estimated = useAtomValue(estimateFamily(props));

  if (!estimated) return null;

  return <TokenAmount {...estimated} />;
};
