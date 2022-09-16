import {
  SendIcon,
  CancelIcon,
  CheckIcon,
  QuorumIcon,
} from '~/util/theme/icons';
import { memo, useState } from 'react';
import { Button } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { useExecute } from '~/mutations/proposal/execute/useExecute';
import { useApprove } from '~/mutations/proposal/approve/useApprove.api';
import { CombinedAccount } from '~/queries/account';
import { Proposal } from '~/queries/proposal';
import { CombinedWallet } from '~/queries/wallets';
import { Actions } from './Actions';
import { useTransactionIsApproved } from './useTransactionIsApproved';
import { useRevokeApproval } from '~/mutations/proposal/approve/useRevokeApproval.api';
import { useExecutionProhibited } from './useExecutionProhibited';

export interface ProposeActionsProps {
  tx: Proposal;
  account: CombinedAccount;
  wallet: CombinedWallet;
}

export const ProposeActions = memo(
  ({ tx, wallet, account }: ProposeActionsProps) => {
    const isApproved = useTransactionIsApproved(tx, wallet);
    const approve = useApprove();
    const revoke = useRevokeApproval();
    const execute = useExecute(account, wallet, tx);
    const goBack = useGoBack();
    const executionProhibited = useExecutionProhibited();

    const [submitting, setSubmitting] = useState(false);

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
            disabled={!!executionProhibited}
            onPress={() => {
              setSubmitting(true);
              execute();
              setSubmitting(false);
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
  },
);
