import { assert } from 'console';
import { Id } from 'lib';
import { useAddrName } from '~/components/addr/useAddrName';
import { TRANSFER_LABEL } from '~/components/call/useProposalLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAccount } from '~/queries/account/useAccount.api';
import { useAccountIds } from '~/queries/account/useAccounts.api';
import { useTransfer } from '~/queries/transfer/useTransfer.sub';
import { ActivityTransfers } from './ActivityTransfers';

export interface IncomingTransferItemProps {
  transfer: Id;
}

export const IncomingTransferItem = withSkeleton(({ transfer: id }: IncomingTransferItemProps) => {
  const transfer = useTransfer(id);
  assert(transfer.direction === 'IN');
  const account = useAccount(transfer.to);
  const accounts = useAccountIds();

  return (
    <ListItem
      leading={transfer.token.addr}
      overline={accounts.length > 1 ? account.name : undefined}
      headline={`${TRANSFER_LABEL} from ${useAddrName(transfer.from)}`}
      supporting={<Timestamp timestamp={transfer.timestamp} weekday />}
      trailing={({ Text }) => <ActivityTransfers transfers={[transfer]} text={Text} />}
    />
  );
}, ListItemSkeleton);
