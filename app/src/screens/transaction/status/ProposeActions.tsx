import { Suspend } from '~/components/Suspender';
import {
  SendIcon,
  CancelIcon,
  CheckIcon,
  QuorumIcon,
} from '~/util/theme/icons';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { useExecute } from '~/mutations/tx/execute/useExecute';
import { useApproveTx } from '~/mutations/tx/approve/useApproveTx.api';
import { CombinedAccount } from '~/queries/account';
import { Tx } from '~/queries/tx';
import { CombinedWallet } from '~/queries/wallets';
import { Actions } from './Actions';
import { useTransactionIsApproved } from './useTransactionIsApproved';
import { useRevokeApproval } from '~/mutations/tx/approve/useRevokeApproval.api';

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
  const goBack = useGoBack();

  const [submitting, setSubmitting] = useState(false);

  if (!account) return <Suspend />;

  return (
    <Actions>
      {!tx.userHasApproved && !isApproved && (
        <Button mode="contained" icon={CheckIcon} onPress={() => approve(tx)}>
          Approve
        </Button>
      )}

      {tx.userHasApproved && !isApproved && (
        <Button
          mode="contained"
          icon={QuorumIcon}
          onPress={() => {
            // TODO: select quorum (part of the wallet) to notify
          }}
        >
          Request
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
          onPress={async () => {
            const txWillBeDeleted = tx.approvals.length === 1;
            revoke(tx);
            if (txWillBeDeleted) goBack();
          }}
        >
          Revoke
        </Button>
      )}
    </Actions>
  );
};
