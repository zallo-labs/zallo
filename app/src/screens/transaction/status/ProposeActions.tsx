import { Suspend } from '@components/Suspender';
import { SendIcon, CancelIcon, CheckIcon } from '@util/theme/icons';
import { useCallback, useState } from 'react';
import { Button } from 'react-native-paper';
import { useExecute } from '~/mutations/tx/execute/useExecute';
import { useApproveTx } from '~/mutations/tx/useApproveTx.api';
import { useRevokeApproval } from '~/mutations/tx/useRevokeApproval.api';
import { CombinedAccount } from '~/queries/account';
import { Tx } from '~/queries/tx';
import { CombinedWallet } from '~/queries/wallets';
import { Actions } from './Actions';
import { useTransactionIsApproved } from './useTransactionIsApproved';

export interface ProposeActionsProps {
  tx: Tx;
  account: CombinedAccount;
  wallet: CombinedWallet;
}

export const ProposeActions = ({
  tx,
  wallet,
  account,
}: ProposeActionsProps) => {
  const isApproved = useTransactionIsApproved(tx, wallet);
  const approve = useApproveTx();
  const revoke = useRevokeApproval();
  const executeMutation = useExecute(account, wallet, tx);

  const [submitting, setSubmitting] = useState(false);

  if (!account) return <Suspend />;

  return (
    <Actions>
      {!tx.userHasApproved && !isApproved && (
        <Button mode="contained" icon={CheckIcon} onPress={() => approve(tx)}>
          Approve
        </Button>
      )}

      {isApproved && (
        <Button
          mode="contained"
          icon={SendIcon}
          loading={submitting}
          onPress={() => {
            setSubmitting(true);
            executeMutation();
            // Execute will cause a re-render once complete
          }}
        >
          Execute
        </Button>
      )}

      {tx.userHasApproved && (
        <Button
          mode="contained-tonal"
          icon={CancelIcon}
          disabled={submitting}
          onPress={() => revoke(tx)}
        >
          Revoke
        </Button>
      )}
    </Actions>
  );
};
