import { Box } from '~/components/layout/Box';
import { Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { Tx, TxStatus } from '~/queries/tx';
import { TransactionActions } from './TransactionActions';
import { TransactionEvents } from './events/TransactionEvents';
import { CombinedWallet } from '~/queries/wallets';

const STATUS_LABEL: Record<TxStatus, string> = {
  proposed: 'Proposed',
  submitted: 'Executing...',
  failed: 'Failed',
  executed: 'Executed',
};

export interface TransactionStatusProps {
  tx: Tx;
  wallet: CombinedWallet;
}

export const TransactionStatus = ({ tx, wallet }: TransactionStatusProps) => {
  return (
    <Card vertical>
      <Box horizontal justifyContent="space-between" flexWrap="wrap">
        <Text variant="headlineLarge">{STATUS_LABEL[tx.status]}</Text>

        <TransactionActions tx={tx} wallet={wallet} />
      </Box>

      <Box mt={2} mr={1}>
        <TransactionEvents tx={tx} wallet={wallet} />
      </Box>
    </Card>
  );
};
