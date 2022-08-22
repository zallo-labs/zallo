import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '~/components2/card/Card';
import { CombinedQuorum } from '~/queries/wallets';
import { ProposalableStatus } from './ProposalableStatus';

export interface QuorumCardProps extends CardProps {
  quorum: CombinedQuorum;
}

export const QuorumCard = memo(({ quorum, ...cardProps }: QuorumCardProps) => {
  // const proposableStyle = useProposableStyle(quorum.state);

  return (
    <Card {...cardProps} style={[cardProps.style]}>
      <Box horizontal alignItems="baseline">
        <Container
          flex={1}
          horizontal
          alignItems="center"
          flexWrap="wrap"
          separator={<Box mx={2} />}
        >
          {quorum.approvers.map((approver) => (
            <Text key={approver} variant="bodyMedium">
              <Addr addr={approver} />
            </Text>
          ))}
        </Container>

        <ProposalableStatus state={quorum.state} as="bodyMedium" />
      </Box>
    </Card>
  );
});
