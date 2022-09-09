import { useTxTransfers } from '../details/useTxTransfers';
import { useTxContext } from '../TransactionProvider';

export enum ExecutionProhibition {
  InactiveAccount = 1,  // Start at 1 to allow for falsy checks
  InactiveWallet,
  InsufficientBalance,
}

export const useExecutionProhibited = () => {
  const { wallet, account, tx } = useTxContext();
  const transfers = useTxTransfers(tx);

  if (tx.status === 'executed') return false;

  if (!account.active) return ExecutionProhibition.InactiveAccount;

  if (wallet.state.status === 'add')
    return ExecutionProhibition.InactiveWallet;

  if (transfers.some((t) => t.amount.gt(t.available)))
    return ExecutionProhibition.InsufficientBalance;

  return false;
};
