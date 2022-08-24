import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { Card, CardProps } from '~/components/card/Card';
import { CombinedQuorum } from '~/queries/wallets';
import { ProposalableStatus } from '../../components/ProposalableStatus';
import { Container } from '~/components/layout/Container';

export interface QuorumCardProps extends CardProps {
  quorum: CombinedQuorum;
}

export const QuorumCard = memo(({ quorum, ...cardProps }: QuorumCardProps) => {
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

        <ProposalableStatus state={quorum.state} />
      </Box>
    </Card>
  );
});
