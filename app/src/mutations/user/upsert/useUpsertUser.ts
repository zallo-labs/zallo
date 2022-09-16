import { createUpsertUserTx } from 'lib';
import { useCallback, useState } from 'react';
import { usePropose } from '~/mutations/proposal/propose/usePropose';
import { useAccount } from '~/queries/account/useAccount.api';
import { CombinedUser, toActiveUser } from '~/queries/user/useUser.api';
import { useApiUpsertUser } from './useUpsertUser.api';

export const useUpsertUser = (user: CombinedUser) => {
  const [account] = useAccount(user.account);
  const apiUpsert = useApiUpsertUser();
  const [propose] = usePropose();

  const [upserting, setUpserting] = useState(false);
  const remove = useCallback(async () => {
    setUpserting(true);

    await propose(
      user.account,
      createUpsertUserTx(account.contract, toActiveUser(user)),
      (proposal) => {
        apiUpsert(user, proposal.hash);
      },
    );

    setUpserting(false);
  }, [account.contract, apiUpsert, propose, user]);

  return [remove, upserting] as const;
};
