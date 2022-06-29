import { Accordion, AccordionProps } from '@components/Accordion';
import { AntDesign } from '@expo/vector-icons';
import { TransferItem } from '@features/activity/TransferItem';
import { useTheme } from 'react-native-paper';
import { ExecutedTx } from '~/queries/tx/useTxs';

export interface TxTransfersAccordionProps extends Partial<AccordionProps> {
  tx: ExecutedTx;
}

export const TxTransfersAccordion = ({
  tx,
  ...accordionProps
}: TxTransfersAccordionProps) => {
  const { iconSize } = useTheme();

  if (!tx.transfers.length) return null;

  return (
    <Accordion
      title="Transfers"
      left={(props) => (
        <AntDesign name="swap" size={iconSize.small} {...props} />
      )}
      {...accordionProps}
    >
      {tx.transfers.map((t) => (
        <TransferItem key={t.id} transfer={t} mx={3} my={1} />
      ))}
    </Accordion>
  );
};
