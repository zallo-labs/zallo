import { combineRest } from '@gql/combine';
import { useMemo } from 'react';
import { Submission, Tx, TxId } from '.';
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
      // Only the last submission *may* be successful
      submissions: apiTx.submissions.filter(
        (submission, i): Submission => ({
          ...submission,
          failed: i < apiTx.submissions.length - 1 || subTx.status === 'failed',
        }),
      ),
    };
  }, [apiTx, subTx]);

  const rest = useMemo(() => combineRest(subRest, apiRest), [subRest, apiRest]);

  return { tx, ...rest };
};
