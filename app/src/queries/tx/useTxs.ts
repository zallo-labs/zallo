import { combine, combineRest, simpleKeyExtractor } from '@gql/combine';
import { useMemo } from 'react';
import { Tx, ExecutedTx } from '.';
import { useApiProposedTxs } from './useTxs.api';
import { useSubExecutedTxs } from './useTxs.sub';

export const useTxs = () => {
  const { executedTxs: subExecutedTxs, ...subRest } = useSubExecutedTxs();
  const { proposedTxs, ...apiRest } = useApiProposedTxs();

  const rest = combineRest(subRest, apiRest);

  const txs: Tx[] = useMemo(
    () =>
      combine(subExecutedTxs, proposedTxs, simpleKeyExtractor('hash'), {
        requireBoth: (sub, api): ExecutedTx => ({
          ...sub,
          ...api,
          id: sub.id,
          timestamp: sub.timestamp,
          status: sub.status,
        }),
        atLeastApi: (_, api) => api,
        // either: ({ sub, api }): Tx => sub ?? api,
      }),
    [subExecutedTxs, proposedTxs],
  );

  return { txs, ...rest };
};
