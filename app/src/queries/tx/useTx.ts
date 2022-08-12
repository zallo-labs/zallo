import { combineRest } from '@gql/combine';
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
    };
  }, [apiTx, subTx]);

  const rest = useMemo(() => combineRest(subRest, apiRest), [subRest, apiRest]);

  return { tx, ...rest };
};
