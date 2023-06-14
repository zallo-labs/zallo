import { useAddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Transfer } from '@api/transfer';
import { useTransfersValue } from '~/components/call/useTransfersValue';
import { FiatValue } from '~/components/fiat/FiatValue';

export interface IncomingTransferItemProps {
  transfer: Transfer;
}

export const IncomingTransferItem = withSuspense(({ transfer }: IncomingTransferItemProps) => {
  return (
    <ListItem
      leading={transfer.token}
      headline={`Transfer from ${useAddressLabel(transfer.from)}`}
      supporting={<Timestamp timestamp={transfer.timestamp} weekday />}
      trailing={({ Text }) => (
        <Text variant="labelLarge">
          <FiatValue value={useTransfersValue([transfer])} />
        </Text>
      )}
    />
  );
}, <ListItemSkeleton leading supporting />);
