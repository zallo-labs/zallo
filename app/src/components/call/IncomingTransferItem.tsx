import { assert } from 'console';
import { Id } from 'lib';
import { useAddressLabel } from '~/components/address/AddressLabel';
import { TRANSFER_LABEL } from '~/components/call/useProposalLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useAccount, useAccountIds } from '@api/account';
import { useTransfer } from '@subgraph/transfer';
import { useTransfersValue } from '~/components/call/useTransfersValue';
import { FiatValue } from '~/components/fiat/FiatValue';

export interface IncomingTransferItemProps {
  transfer: Id;
}

export const IncomingTransferItem = withSuspense(({ transfer: id }: IncomingTransferItemProps) => {
  const transfer = useTransfer(id);
  assert(transfer.direction === 'IN');
  const account = useAccount(transfer.to);
  const accounts = useAccountIds();

  return (
    <ListItem
      leading={transfer.token.addr}
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
