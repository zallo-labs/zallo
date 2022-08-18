import { combine, combineRest, simpleKeyExtractor } from '@gql/combine';
import { useMemo } from 'react';
import { Tx, TxId } from '.';
import { useApiTx } from './useTx.api';
import { useSubTx } from './useTx.sub';

export const useTx = (id: TxId) => {
  const { tx: apiTx, ...apiRest } = useApiTx(id);
  const { tx: subTx, ...subRest } = useSubTx(id);

  const tx = useMemo((): Tx | undefined => {
    if (!subTx) return apiTx;
    if (!apiTx) return subTx;

    return {
      ...subTx,
      ...apiTx,
      timestamp: subTx.timestamp,
      status: subTx.status ?? apiTx.status,
      submissions: combine(
        subTx.submissions,
        apiTx.submissions,
        simpleKeyExtractor('hash'),
        {
          either: ({ sub, api }) => {
            if (!sub) return api!;
            if (!api) return sub;

            return {
              ...api,
              timestamp: sub.timestamp,
              status: sub.status,
            };
          },
        },
      ),
    };
  }, [apiTx, subTx]);

  const rest = useMemo(() => combineRest(subRest, apiRest), [subRest, apiRest]);

  return { tx, ...rest };
};
