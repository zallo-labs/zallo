import { useAddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { FiatValue } from '~/components/fiat/FiatValue';
import { FragmentType, gql, useFragment } from '@api/gen';
import { asBigInt } from 'lib';

const FragmentDoc = gql(/* GraphQL */ `
  fragment IncomingTransferItem_TransferFragment on Transfer {
    tokenAddress
    from
    timestamp
    value
  }
`);

export interface IncomingTransferItemProps {
  transfer: FragmentType<typeof FragmentDoc>;
}

export const IncomingTransferItem = withSuspense((props: IncomingTransferItemProps) => {
  const transfer = useFragment(FragmentDoc, props.transfer);

  return (
    <ListItem
      leading={transfer.tokenAddress}
      headline={`Transfer from ${useAddressLabel(transfer.from)}`}
      supporting={<Timestamp timestamp={transfer.timestamp} weekday />}
      trailing={({ Text }) =>
        transfer.value !== null && transfer.value !== undefined ? (
          <Text variant="labelLarge">
            <FiatValue value={asBigInt(transfer.value)} />
          </Text>
        ) : null
      }
    />
  );
}, <ListItemSkeleton leading supporting />);
