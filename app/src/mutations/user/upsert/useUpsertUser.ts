import { Address, createUpsertUserTx } from 'lib';
import { useCallback, useState } from 'react';
import {
  OnPropose,
  showProposalSnack,
  usePropose,
} from '~/mutations/proposal/propose/usePropose';
import { useAccount } from '~/queries/account/useAccount.api';
import { CombinedUser, toProposedUser } from '~/queries/user/useUser.api';
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
    async (user: CombinedUser, onPropose?: OnPropose) => {
      setUpserting(true);

      const p = async () => {
        await propose(
          user.account,
          createUpsertUserTx(account.contract, toProposedUser(user)),
          async (proposal, navigation) => {
            await apiUpsert(user, proposal.hash);
            showProposalSnack(proposal, navigation);
            onPropose?.(proposal, navigation);
          },
        );

        setUpserting(false);
      };

      if (user.configs.proposal) {
        confirm({ onConfirm: p });
      } else {
        await p();
      }
    },
    [account.contract, apiUpsert, confirm, propose],
  );

  return [upsert, upserting] as const;
};
