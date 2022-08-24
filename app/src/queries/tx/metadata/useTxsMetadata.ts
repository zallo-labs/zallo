import { combine, combineRest, simpleKeyExtractor } from '~/gql/combine';
import { useMemo } from 'react';
import { TxMetadata } from '..';
import { useApiTxsMetadata } from './useTxsMetadata.api';
import { useSubTxsMetadata } from './useTxsMetadata.sub';

export const useTxsMetadata = () => {
  const { txs: subTxs, ...subRest } = useSubTxsMetadata();
  const { txs: apiTxs, ...apiRest } = useApiTxsMetadata();

  const txs = useMemo(
    (): TxMetadata[] =>
      combine(subTxs, apiTxs, simpleKeyExtractor('id'), {
        either: ({ sub, api }) => ({
          ...api!,
          ...sub!,
        }),
      }),
    [apiTxs, subTxs],
  );

  const rest = useMemo(() => combineRest(subRest, apiRest), [subRest, apiRest]);

  return { txs, ...rest };
};
