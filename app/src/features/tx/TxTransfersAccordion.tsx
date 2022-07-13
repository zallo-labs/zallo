import { Accordion, AccordionProps } from '@components/Accordion';
import { TransferItem } from '@features/activity/TransferItem';
import { ExecutedTx } from '~/queries/tx';

export interface TxTransfersAccordionProps extends Partial<AccordionProps> {
  tx: ExecutedTx;
}

export const TxTransfersAccordion = ({
  tx,
  ...accordionProps
}: TxTransfersAccordionProps) => {
  if (!tx.transfers.length) return null;

  return (
    <Accordion title="Transfers" {...accordionProps}>
      {tx.transfers.map((t) => (
        <TransferItem key={t.id} transfer={t} mx={3} my={1} />
      ))}
    </Accordion>
  );
};
