import { Box } from '~/components/layout/Box';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { ProposalStatus } from '~/queries/proposal';
import { TransactionActions } from './actions/TransactionActions';
import { TransactionEvents } from './events/TransactionEvents';
import { useTxContext } from '../TransactionProvider';
import { FC } from 'react';

const STATUS_LABEL: Record<ProposalStatus, [FC | null, string]> = {
  proposed: [null, 'Proposed'],
  pending: [() => <ActivityIndicator />, 'Executing...'],
  failed: [null, 'Failed'],
  executed: [null, 'Executed'],
};

export const TransactionStatus = () => {
  const { proposal } = useTxContext();

  const [Icon, label] = STATUS_LABEL[proposal.status];

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

        <TransactionActions proposal={proposal} />
      </Box>

      <Box mt={1}>
        <TransactionEvents />
      </Box>
    </Card>
  );
};
