import { useAddressLabel } from '~/components/address/AddressLabel';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem } from '~/components/list/ListItem';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { FiatValue } from '~/components/fiat/FiatValue';
import { FragmentType, gql, useFragment } from '@api/gen';
import { TokenIcon } from '../token/TokenIcon/TokenIcon';

const FragmentDoc = gql(/* GraphQL */ `
  fragment IncomingTransferItem_TransferFragment on Transfer {
    token {
      id
      ...TokenIcon_token
    }
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
      leading={(props) => <TokenIcon token={transfer.token} {...props} />}
      leadingSize="medium"
      headline={`Transfer from ${useAddressLabel(transfer.from)}`}
      supporting={<Timestamp timestamp={transfer.timestamp} weekday />}
      trailing={({ Text }) =>
        transfer.value !== null && transfer.value !== undefined ? (
          <Text variant="labelLarge">
            <FiatValue value={transfer.value} />
          </Text>
        ) : null
      }
    />
  );
}, <ListItemSkeleton leading supporting />);
