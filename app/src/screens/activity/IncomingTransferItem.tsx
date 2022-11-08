import { assert } from 'console';
import { Id } from 'lib';
import { Text } from 'react-native-paper';
import { Addr } from '~/components/addr/Addr';
import { TRANSFER_LABEL } from '~/components/call/useProposalLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ItemSkeleton } from '~/components/item/ItemSkeleton';
import { Box } from '~/components/layout/Box';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';
import { TransferType } from '~/gql/generated.sub';
import { useTransfer } from '~/queries/transfer/useTransfer.sub';
import { ActivityTransfers } from './ActivityTransfers';

export interface IncomingTransferItemProps {
  id: Id;
}

export const IncomingTransferItem = withSkeleton(
  ({ id }: IncomingTransferItemProps) => {
    const [transfer] = useTransfer(id);
    assert(transfer.direction === TransferType.In);

    return (
      <Box>
        <Box horizontal>
          <TokenIcon token={transfer.token} />

          <Box flex={1}>
            <Text variant="titleMedium">
              {`${TRANSFER_LABEL} from `} <Addr addr={transfer.from} />
            </Text>

            <Text variant="bodyMedium">
              <Timestamp timestamp={transfer.timestamp} weekday />
            </Text>
          </Box>
        </Box>

        <ActivityTransfers transfers={[transfer]} />
      </Box>
    );
  },
  ItemSkeleton,
);
