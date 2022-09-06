import { Box } from '~/components/layout/Box';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { TxStatus } from '~/queries/tx';
import { TransactionActions } from './TransactionActions';
import { TransactionEvents } from './events/TransactionEvents';
import { useTxContext } from '../TransactionProvider';
import { FC } from 'react';

const STATUS_LABEL: Record<TxStatus, [FC | null, string]> = {
  proposed: [null, 'Proposed'],
  submitted: [() => <ActivityIndicator />, 'Executing...'],
  failed: [null, 'Failed'],
  executed: [null, 'Executed'],
};

export const TransactionStatus = () => {
  const { tx, wallet } = useTxContext();

  const [Icon, label] = STATUS_LABEL[tx.status];

  return (
    <Card vertical>
      <Box horizontal justifyContent="space-between" flexWrap="wrap">
        <Box horizontal alignItems="center">
          {Icon && (
            <Box mr={2}>
              <Icon />
            </Box>
          )}

          <Text variant="headlineLarge">{label}</Text>
        </Box>

        <TransactionActions tx={tx} wallet={wallet} />
      </Box>

      <Box mt={2} mr={1}>
        <TransactionEvents tx={tx} wallet={wallet} />
      </Box>
    </Card>
  );
};
