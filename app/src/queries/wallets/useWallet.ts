import { combine } from '~/gql/combine';
import { hashQuorum, toQuorum } from 'lib';
import { useMemo } from 'react';
import { CombinedWallet, WalletId } from '.';
import { useApiWallet } from './useWallet.api';
import { useSubWallet } from './useWallet.sub';

export const useWallet = (id?: WalletId) => {
  const { subWallet: s } = useSubWallet(id);
  const { apiWallet: a } = useApiWallet(id);

  return useMemo((): CombinedWallet | undefined => {
    if (!s && !a) return undefined;
    if (!s) return a;
    if (!a) return s;

    return {
      ...a,
      state: a.state === 'removed' ? 'removed' : 'active',
      quorums: combine(
        s.quorums,
        a.quorums,
        {
          sub: (s) => hashQuorum(toQuorum(s.approvers)),
          api: (a) => hashQuorum(toQuorum(a.approvers)),
        },
        {
          either: ({ sub, api }) => {
            if (!sub) return api!;
            if (!api) return sub;

            return {
              state: api.state === 'removed' ? 'removed' : 'active',
              approvers: sub.approvers,
            };
          },
        },
      ),
    };
  }, [a, s]);
};
