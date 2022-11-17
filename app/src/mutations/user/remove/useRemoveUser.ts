import { createRemoveUserTx } from 'lib';
import { useCallback, useState } from 'react';
import { showProposalSnack, usePropose } from '~/mutations/proposal/propose/usePropose';
import { useAccount } from '~/queries/account/useAccount.api';
import { CombinedUser, toActiveUser } from '~/queries/user/useUser.api';
import { useApiRemoveUser } from './useRemoveUser.api';

export const useRemoveUser = (user: CombinedUser) => {
  const [account] = useAccount(user);
  const apiRemove = useApiRemoveUser();
  const [propose] = usePropose();

  const [removing, setRemoving] = useState(false);
  const remove = useCallback(async () => {
    setRemoving(true);

    if (user.isActive) {
      await propose(
        user.account,
        createRemoveUserTx(account.contract, toActiveUser(user)),
        async (proposal, navigation) => {
          await apiRemove(user, proposal.hash);
          showProposalSnack(proposal, navigation);
        },
      );
    } else {
      await apiRemove(user, undefined);
    }

    setRemoving(false);
  }, [account.contract, apiRemove, propose, user]);

  return [remove, removing] as const;
};
