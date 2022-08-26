import { Box } from '~/components/layout/Box';
import { memo } from 'react';
import { Card, CardProps } from '~/components/card/Card';
import { CombinedQuorum } from '~/queries/wallets';
import { ProposableStatusIcon } from '~/components/ProposableStatus/ProposableStatusIcon';
import { AddrList } from '~/components/addr/AddrList';

export interface QuorumCardProps extends CardProps {
  quorum: CombinedQuorum;
}

export const QuorumCard = memo(({ quorum, ...cardProps }: QuorumCardProps) => {
  return (
    <Card {...cardProps} style={[cardProps.style]}>
      <Box horizontal alignItems="center">
        <AddrList addresses={quorum.approvers} />

        <ProposableStatusIcon state={quorum.state} />
      </Box>
    </Card>
  );
});
