import { Accordion, AccordionProps } from '@components/Accordion';
import { SECONDARY_ICON_SIZE } from '@components/list/Item';
import { AntDesign } from '@expo/vector-icons';
import { TransferItem } from '@features/activity/TransferItem';
import { ExecutedTx } from '~/queries/tx/useTxs';

export interface TxTransfersAccordionProps extends Partial<AccordionProps> {
  tx: ExecutedTx;
}

export const TxTransfersAccordion = ({
  tx,
  ...accordionProps
}: TxTransfersAccordionProps) => {
  if (!tx.transfers.length) return null;

  return (
    <Accordion
      title="Transfers"
      left={(props) => (
        <AntDesign name="swap" size={SECONDARY_ICON_SIZE} {...props} />
      )}
      {...accordionProps}
    >
      {tx.transfers.map((t) => (
        <TransferItem key={t.id} transfer={t} mx={3} my={1} />
      ))}
    </Accordion>
  );
};
