import { useTxTransfers } from '../details/useTxTransfers';
import { useTxContext } from '../TransactionProvider';

export enum ExecutionProhibition {
  InactiveAccount = 1, // Start at 1 to allow for falsy checks
  InactiveUser,
  InsufficientBalance,
}

export const useExecutionProhibited = () => {
  const { proposer, account, proposal } = useTxContext();
  const transfers = useTxTransfers(proposal);

  if (proposal.status === 'executed') return false;

  if (!account.active) return ExecutionProhibition.InactiveAccount;

  if (!proposer.isActive) return ExecutionProhibition.InactiveUser;

  if (transfers.some((t) => t.amount.gt(t.available)))
    return ExecutionProhibition.InsufficientBalance;

  return false;
};
