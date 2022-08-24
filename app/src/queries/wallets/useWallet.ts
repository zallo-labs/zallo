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

    // console.log(
    //   JSON.stringify(
    //     {
    //       a,
    //     },
    //     null,
    //     2,
    //   ),
    // );

    return {
      ...a,
      state: a.state === 'remove' ? 'remove' : 'active',
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
              ...api,
              state: api.state === 'remove' ? 'remove' : 'active',
            };
          },
        },
      ),
    };
  }, [a, s]);
};
