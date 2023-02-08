import { Address, QuorumGuid } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { useAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/useUser.api';

export const useSelectQuorum = (accountAddr: Address) => {
  const { navigate } = useRootNavigation();
  const account = useAccount(accountAddr);
  const user = useUser();

  return useCallback(async () => {
    const userQuorums = account.quorums.filter((q) => q.active?.approvers.has(user.id));

    return userQuorums.length === 1
      ? userQuorums[0]
      : new Promise<QuorumGuid>((resolve) => {
          navigate('AccountQuorumsModal', {
            account: accountAddr,
            onSelect: resolve,
          });
        });
  }, [account.quorums, accountAddr, navigate, user.id]);
};
