import { combine } from '~/gql/combine';
import { hashQuorum, toQuorum } from 'lib';
import { useMemo } from 'react';
import { CombinedWallet, WalletId } from '../wallets';
import { useApiWallet } from './useWallet.api';
import { useSubWallet } from './useWallet.sub';
import _ from 'lodash';

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
      // TODO: enable once spending limits module is implemented
      // limits: {
      //   allowlisted: mergeProposals(a.limits.allowlisted, s.limits.allowlisted),
      //   tokens: Object.fromEntries(
      //     new Set(
      //       [
      //         ...Object.keys(a.limits.tokens ?? {}),
      //         ...Object.keys(s.limits.tokens ?? {}),
      //       ].map((token): [Address, Proposable<TokenLimit>] => [
      //         token as Address,
      //         mergeProposals(
      //           a.limits?.tokens?.[token as Address],
      //           s.limits?.tokens?.[token as Address],
      //         ),
      //       ]),
      //     ),
      //   ),
      // },
      limits: {
        allowlisted: {
          ...a.limits.allowlisted,
          ...(typeof a.limits.allowlisted.proposed === 'boolean' && {
            active: a.limits.allowlisted.proposed,
          }),
        },
        tokens: _.mapValues(a.limits.tokens, (v) => ({
          ...v,
          ...(typeof v.proposed === 'boolean' && { active: v.proposed }),
        })),
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
