import { Address } from 'lib';
import { useCallback } from 'react';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { showInfo } from '~/provider/SnackbarProvider';
import { useAccount } from '~/queries/account/useAccount.api';
import { useUser } from '~/queries/useUser.api';
import { OnSelectQuorum } from './AccountQuorumsScreen';

export const useSelectQuorum = (accountAddr: Address) => {
  const { navigate } = useRootNavigation();
  const account = useAccount(accountAddr);
  const user = useUser();

  return useCallback(
    (onSelect: OnSelectQuorum) => {
      const userQuorums = account.quorums.filter((q) => q.active?.approvers.has(user.id));
      if (userQuorums.length === 1) {
        onSelect(userQuorums[0]);
      } else {
        showInfo('Select quorum');
        navigate('AccountQuorums', {
          account: accountAddr,
          onSelect,
        });
      }
    },
    [account.quorums, accountAddr, navigate, user.id],
  );
};
