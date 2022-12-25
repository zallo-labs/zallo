import { Address } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { useAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/useUser.api';
import { OnSelectQuorum } from './AccountScreen';

export const useSelectQuorum = (accountAddr: Address) => {
  const { navigate } = useRootNavigation();
  const account = useAccount(accountAddr);
  const user = useUser();

  return useCallback(
    (onSelectQuorum: OnSelectQuorum) => {
      const userQuorums = account.quorums.filter((q) => q.active?.value?.approvers.has(user.id));
      if (userQuorums.length === 1) {
        onSelectQuorum(userQuorums[0]);
      } else {
        navigate('Account', {
          title: 'Select quorum',
          account: accountAddr,
          onSelectQuorum,
        });
      }
    },
    [account.quorums, accountAddr, navigate, user.id],
  );
};
