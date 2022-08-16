import { Box } from '@components/Box';
import { Text } from 'react-native-paper';
import { Card } from '~/components2/card/Card';
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
        <TransactionEvents tx={tx} />
      </Box>
    </Card>
  );
};
