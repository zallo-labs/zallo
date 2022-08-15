import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '~/components2/card/Card';
import { CombinedQuorum } from '~/queries/wallets';

export interface QuorumCardProps extends CardProps {
  quorum: CombinedQuorum;
}

export const QuorumCard = memo(({ quorum, ...cardProps }: QuorumCardProps) => (
  <Card {...cardProps}>
    <Container horizontal separator={<Box mx={2} />}>
      {quorum.approvers.map((approver) => (
        <Text key={approver} variant="bodyMedium">
          <Addr addr={approver} />
        </Text>
      ))}
    </Container>
  </Card>
));
