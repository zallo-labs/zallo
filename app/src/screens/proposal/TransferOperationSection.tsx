import { Operation } from 'lib';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { ListItem } from '~/components/list/ListItem';
import { useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { tryDecodeTransfer } from '~/util/decode';

export interface TransferOperationSectionProps {
  op: Operation;
}

export function TransferOperationSection({ op }: TransferOperationSectionProps) {
  const transfer = tryDecodeTransfer(op.data);

  if (!transfer) return null;

  return (
    <>
      <ListItem leading={transfer.to} overline="To" headline={useAddressLabel(transfer.to)} />
      <ListItem
        leading={op.to}
        overline="Amount"
        headline={useFormattedTokenAmount({ token: op.to, amount: transfer.amount })}
      />
    </>
  );
}
