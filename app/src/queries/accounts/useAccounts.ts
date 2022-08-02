import { filterFirst, hashQuorum, toQuorums } from 'lib';
import { combineRest, combine, simpleKeyExtractor } from '@gql/combine';
import { CombinedAccount } from '.';
import { useApiUserAccounts } from './useAccounts.api';
import { useSubUserAccounts } from './useAccounts.sub';

export const useAccounts = () => {
  const { data: subAccounts, ...subRest } = useSubUserAccounts();
  const { data: apiAccounts, ...apiRest } = useApiUserAccounts();

  const rest = combineRest(subRest, apiRest);

  const accounts = combine(subAccounts, apiAccounts, simpleKeyExtractor('id'), {
    either: ({ sub: s, api: a }): CombinedAccount => ({
      id: s?.id || a!.id,
      safeAddr: s?.safeAddr || a!.safeAddr,
      ref: s?.ref || a!.ref,
      name: a?.name ?? '',
      quorums: toQuorums(
        filterFirst([...(s?.quorums ?? []), ...(a?.quorums ?? [])], (quorum) =>
          hashQuorum(quorum),
        ),
      ),
    }),
  });

  return { accounts, ...rest };
};
