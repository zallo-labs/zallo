import { filterFirst, hashQuorum } from 'lib';
import { combineRest, combine, simpleKeyExtractor } from '@gql/combine';
import { CombinedWallet } from '.';
import { useApiUserWallets } from './useWallets.api';
import { useSubUserWallets } from './useWallets.sub';

export const useWallets = () => {
  const { data: subWallets, ...subRest } = useSubUserWallets();
  const { data: apiWallets, ...apiRest } = useApiUserWallets();

  const rest = combineRest(subRest, apiRest);

  const wallets = combine(subWallets, apiWallets, simpleKeyExtractor('id'), {
    either: ({ sub: s, api: a }): CombinedWallet => ({
      id: s?.id || a!.id,
      accountAddr: s?.accountAddr || a!.accountAddr,
      ref: s?.ref || a!.ref,
      name: a?.name ?? '',
      active: s?.active,
      quorums: filterFirst(
        [...(s?.quorums ?? []), ...(a?.quorums ?? [])],
        (q) => hashQuorum(q.approvers),
        (a, b) => Number(b.active) - Number(a.active),
      ),
    }),
  });

  return { wallets, ...rest };
};
