import { Divider } from '@components/Divider';
import { Container } from '@components/list/Container';
import { txReqToCalls } from '@util/multicall';
import { useMemo } from 'react';
import { Tx } from '~/queries/tx';
import { CallDetails } from './CallDetails';

export interface TxDetailsProps {
  tx: Tx;
}

export const TxDetails = ({ tx }: TxDetailsProps) => {
  const calls = useMemo(() => txReqToCalls(tx), [tx]);

  return (
    <Container ml={4} mr={3} mb={2} separator={<Divider my={2} />}>
      {calls.map((call, i) => (
        <CallDetails
          key={i}
          call={call}
          title={calls.length > 1 ? `#${i + 1}` : undefined}
        />
      ))}
    </Container>
  );
};
