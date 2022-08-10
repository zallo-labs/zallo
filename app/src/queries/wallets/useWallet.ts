import { filterFirst, hashQuorum } from 'lib';
import { useMemo } from 'react';
import { CombinedWallet, WalletId } from '.';
import { useApiWallet } from './useWallet.api';
import { useSubWallet } from './useWallet.sub';

export const useWallet = (id: WalletId) => {
  const { subWallet: s } = useSubWallet(id);
  const { apiWallet: a } = useApiWallet(id);

  return useMemo(
    (): CombinedWallet => ({
      ...id,
      name: a?.name ?? '',
      active: s?.active,
      quorums: filterFirst(
        [...(s?.quorums ?? []), ...(a?.quorums ?? [])],
        (q) => hashQuorum(q.approvers),
        (a, b) => Number(b.active) - Number(a.active),
      ),
    }),
    [a?.name, a?.quorums, id, s?.active, s?.quorums],
  );
};
