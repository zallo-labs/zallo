import { Divider } from '@components/Divider';
import { Container } from '@components/list/Container';
import { hexlify } from 'ethers/lib/utils';
import { Tx } from '~/queries/tx/useTxs';
import { OpDetails } from './OpDetails';

export interface TxDetailsProps {
  tx: Tx;
}

export const TxDetails = ({ tx }: TxDetailsProps) => {
  return (
    <Container ml={4} mr={3} mb={2} separator={<Divider my={2} />}>
      {tx.ops.map((op, i) => (
        <OpDetails
          key={hexlify(op.hash)}
          op={op}
          title={tx.ops.length > 1 ? `#${i + 1}` : undefined}
        />
      ))}
    </Container>
  );
};
