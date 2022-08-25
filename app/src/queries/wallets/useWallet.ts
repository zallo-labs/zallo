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
      state: {
        ...a.state,
        status: a.state.status === 'remove' ? a.state.status : s.state.status,
      },
      quorums: combine(
        s.quorums,
        a.quorums,
        {
          sub: (s) => hashQuorum(toQuorum(s.approvers)),
          api: (a) => hashQuorum(toQuorum(a.approvers)),
        },
        {
          either: ({ sub: sq, api: aq }) => {
            if (!sq) return aq!;
            if (!aq) return sq;

            return {
              ...aq,
              state: {
                ...aq.state,
                status:
                  aq.state.status === 'remove'
                    ? aq.state.status
                    : sq.state.status,
              },
            };
          },
        },
      ),
    };
  }, [a, s]);
};
