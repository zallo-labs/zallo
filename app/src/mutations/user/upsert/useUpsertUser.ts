import { Address, createUpsertUserTx } from 'lib';
import { useCallback, useState } from 'react';
import { usePropose } from '~/mutations/proposal/propose/usePropose';
import { useAccount } from '~/queries/account/useAccount.api';
import { CombinedUser, toActiveUser } from '~/queries/user/useUser.api';
import {
  AlertModalScreenParams,
  useAlertConfirmation,
} from '~/screens/alert/AlertModalScreen';
import { useApiUpsertUser } from './useUpsertUser.api';

const ALERT: Partial<AlertModalScreenParams> = {
  title: 'Overwrite existing proposal?',
  message:
    'Are you sure you want to overwrite the existing modification proposal for this user?',
};

export const useUpsertUser = (accountAddr: Address) => {
  const [account] = useAccount(accountAddr);
  const apiUpsert = useApiUpsertUser();
  const [propose] = usePropose();
  const confirm = useAlertConfirmation(ALERT);

  const [upserting, setUpserting] = useState(false);
  const upsert = useCallback(
    async (user: CombinedUser) => {
      setUpserting(true);

      confirm({
        onConfirm: async () => {
          await propose(
            user.account,
            createUpsertUserTx(account.contract, toActiveUser(user)),
            (proposal) => {
              apiUpsert(user, proposal.hash);
            },
          );

          setUpserting(false);
        },
      });
    },
    [account.contract, apiUpsert, confirm, propose],
  );

  return [upsert, upserting] as const;
};
