import { useAccountIds } from '@api/account';
import { useAccountSubscription } from '@api/account/useAccountsSubscription';
import { useProposalSubscription } from '@api/proposal';

export const Subscriptions = () => {
  const accounts = useAccountIds();

  useAccountSubscription(); // Subscribes to all user accounts
  useProposalSubscription({ accounts });

  return null;
};
