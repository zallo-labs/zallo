import { Suspend } from '@components/Suspender';
import { useAccount } from '~/queries/account/useAccount';
import { Tx } from '~/queries/tx';
import { CombinedWallet } from '~/queries/wallets';
import { FailedActions } from './FailedActions';
import { ProposeActions } from './ProposeActions';

export interface TransactionActionsProps {
  tx: Tx;
  wallet: CombinedWallet;
}

export const TransactionActions = ({ tx, wallet }: TransactionActionsProps) => {
  const { account } = useAccount(wallet.accountAddr);

  if (!account) return <Suspend />;

  if (tx.status === 'proposed')
    return <ProposeActions tx={tx} account={account} wallet={wallet} />;

  if (tx.status === 'failed')
    return <FailedActions tx={tx} account={account} wallet={wallet} />;

  return null;
};
