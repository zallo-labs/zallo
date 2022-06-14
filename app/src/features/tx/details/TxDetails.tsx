import { Accordion } from '@components/Accordion';
import { Box } from '@components/Box';
import { Divider } from '@components/Divider';
import { Container } from '@components/list/Container';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { hexlify } from 'ethers/lib/utils';
import { Tx } from '~/queries/tx/useTxs';
import { OpDetails } from './OpDetails';

export interface TxDetailsProps {
  tx: Tx;
}

export const TxDetails = ({ tx }: TxDetailsProps) => {
  return (
    <Accordion
      title="Details"
      left={(props) => (
        <MaterialCommunityIcons name="script-text" size={25} {...props} />
      )}
      mx={3}
      py={2}
    >
      <Container
        ml={4}
        mr={3}
        separator={
          <Box my={2}>
            <Divider />
          </Box>
        }
      >
        {tx.ops.map((op, i) => (
          <OpDetails
            key={hexlify(op.hash)}
            op={op}
            title={tx.ops.length > 1 ? `#${i + 1}` : undefined}
          />
        ))}
      </Container>
    </Accordion>
  );
};
