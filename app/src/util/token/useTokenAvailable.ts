import { sumBn, ZERO } from 'lib';
import { CombinedQuorum, useQuorum } from '~/queries/useQuorum.api';
import { Token } from './token';
import { useTokenBalance } from './useTokenBalance';
import { Accountlike, useAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/useUser.api';

export const useTokenAvailable = (token: Token, accountlike: Accountlike) => {
  const balance = useTokenBalance(token, accountlike);
  const user = useUser();
  const account = useAccount(accountlike);
  const quorum = useQuorum(typeof accountlike === 'object' ? accountlike : undefined);

  const available = (quorum: CombinedQuorum) => {
    const active = quorum.active?.value;
    if (!active) return ZERO;

    const limit = active.spending?.limit?.[token.addr];
    if (limit) return limit.amount;

    if (active.spending?.fallback === 'deny') return ZERO;

    return balance;
  };

  if (quorum) return available(quorum);

  const userQuorums = account.quorums.filter((q) => q.active?.value?.approvers.has(user.id));

  return sumBn(userQuorums.map(available));
};
