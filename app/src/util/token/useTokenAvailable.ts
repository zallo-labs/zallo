import { sumBn, ZERO } from 'lib';
import { useQuorum } from '~/queries/quroum/useQuorum.api';
import { Token } from './token';
import { useTokenBalance } from './useTokenBalance';
import { Accountlike, useAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/useUser.api';
import { CombinedQuorum } from '~/queries/quroum';

export const useTokenAvailable = (token: Token, accountlike: Accountlike) => {
  const balance = useTokenBalance(token, accountlike);
  const user = useUser();
  const account = useAccount(accountlike);
  const quorum = useQuorum(typeof accountlike === 'object' ? accountlike : undefined);

  const available = (quorum: CombinedQuorum) => {
    const active = quorum.active;
    if (!active) return ZERO;

    const limit = active.spending?.limit?.[token.addr];
    if (limit) return limit.amount;

    if (active.spending?.fallback === 'deny') return ZERO;

    return balance;
  };

  if (quorum) return available(quorum);

  const userQuorums = account.quorums.filter((q) => q.active?.approvers.has(user.id));

  return sumBn(userQuorums.map(available));
};
