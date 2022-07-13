import { combine, combineRest, simpleKeyExtractor } from '@gql/combine';
import { BytesLike } from 'ethers';
import { useMemo } from 'react';
import { Tx, ExecutedTx, ProposedTx } from '.';
import { useApiProposedTxs } from './useTxs.api';
import { useSubExecutedTxs } from './useTxs.sub';

export const useTxs = () => {
  const { executedTxs: subExecutedTxs, ...subRest } = useSubExecutedTxs();
  const { proposedTxs, ...apiRest } = useApiProposedTxs();

  const rest = combineRest(subRest, apiRest);

  const txs: Tx[] = useMemo(
    () =>
      combine<ExecutedTx, ProposedTx, BytesLike, Tx>(
        subExecutedTxs,
        proposedTxs,
        simpleKeyExtractor('hash'),
        {
          requireBoth: (sub, api): ExecutedTx => ({
            ...sub,
            ...api,
            id: sub.id,
            timestamp: sub.timestamp,
            status: sub.status,
          }),
          atLeastApi: (_, api) => api,
          // either: ({ sub, api }): Tx => sub ?? api,
        },
      ),
    [subExecutedTxs, proposedTxs],
  );

  return { txs, ...rest };
};
