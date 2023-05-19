import { useAccountIds } from '@api/account';
import { useAccountSubscription } from '@api/account/useAccountsSubscription';
import { useEmitProposalExecutionEvents, useProposalSubscription } from '@api/proposal';
import { useTransferSubscription } from '@api/transfer';

export const Subscriptions = () => {
  const accounts = useAccountIds();

  useAccountSubscription(); // Subscribes to all user accounts

  useProposalSubscription({ variables: { input: { accounts } } });
  useEmitProposalExecutionEvents({ accounts });

  useTransferSubscription();

  return null;
};
