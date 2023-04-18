import { useAddressLabel } from '~/components/address/AddressLabel';
import { TRANSFER_LABEL } from '~/components/call/useProposalLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { Transfer, useAccount, useAccountIds } from '@api/account';
import { useTransfersValue } from '~/components/call/useTransfersValue';
import { FiatValue } from '~/components/fiat/FiatValue';

export interface IncomingTransferItemProps {
  transfer: Transfer;
}

export const IncomingTransferItem = withSuspense(({ transfer }: IncomingTransferItemProps) => {
  const account = useAccount(transfer.to);
  const accounts = useAccountIds();

  return (
    <ListItem
      leading={transfer.token}
      overline={accounts.length > 1 ? account.name : undefined}
      headline={`${TRANSFER_LABEL} from ${useAddressLabel(transfer.from)}`}
      supporting={<Timestamp timestamp={transfer.timestamp} weekday />}
      trailing={({ Text }) => (
        <Text variant="labelLarge">
          <FiatValue value={useTransfersValue([transfer])} />
        </Text>
      )}
    />
  );
}, <ListItemSkeleton leading supporting />);
