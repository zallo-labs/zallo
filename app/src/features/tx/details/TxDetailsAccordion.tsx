import { Accordion, AccordionProps } from '@components/Accordion';
import { Divider } from '@components/Divider';
import { Container } from '@components/list/Container';
import { SECONDARY_ICON_SIZE } from '@components/list/Item';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { hexlify } from 'ethers/lib/utils';
import { Tx } from '~/queries/tx/useTxs';
import { OpDetails } from './OpDetails';

export interface TxDetailsAccordionProps extends Partial<AccordionProps> {
  tx: Tx;
}

export const TxDetailsAccordion = ({
  tx,
  ...accordionProps
}: TxDetailsAccordionProps) => {
  return (
    <Accordion
      title="Details"
      left={(props) => (
        <MaterialCommunityIcons
          name="script-text"
          size={SECONDARY_ICON_SIZE}
          {...props}
        />
      )}
      {...accordionProps}
    >
      <Container ml={4} mr={3} mb={2} separator={<Divider my={2} />}>
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
