import { RetryIcon } from '~/util/theme/icons';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useExecute } from '~/mutations/proposal/execute/useExecute';
import { CombinedAccount } from '~/queries/account';
import { Proposal } from '~/queries/proposal';
import { CombinedWallet } from '~/queries/wallets';
import { Actions } from './Actions';

export interface FailedActionsProps {
  tx: Proposal;
  account: CombinedAccount;
  wallet: CombinedWallet;
}

export const FailedActions = ({ tx, account, wallet }: FailedActionsProps) => {
  const executeMutation = useExecute(account, wallet, tx);

  const [submitting, setSubmitting] = useState(false);

  return (
    <Actions>
      <Button
        mode="contained"
        icon={RetryIcon}
        loading={submitting}
        onPress={() => {
          setSubmitting(true);
          executeMutation();
          // Execute will cause a re-render once complete
        }}
      >
        Retry
      </Button>
    </Actions>
  );
};
