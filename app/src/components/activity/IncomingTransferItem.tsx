import { useAddressLabel } from '#/address/AddressLabel';
import { Timestamp } from '#/format/Timestamp';
import { ListItem } from '#/list/ListItem';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { FiatValue } from '#/FiatValue';
import { FragmentType, gql, useFragment } from '@api/generated';
import { TokenIcon } from '../token/TokenIcon';
import { asUAddress } from 'lib';

const Transfer = gql(/* GraphQL */ `
  fragment IncomingTransferItem_Transfer on Transfer {
    account {
      id
      chain
    }
    token {
      id
      ...TokenIcon_Token
    }
    from
    timestamp
    value
  }
`);

export interface IncomingTransferItemProps {
  transfer: FragmentType<typeof Transfer>;
}

function IncomingTransferItem_(props: IncomingTransferItemProps) {
  const transfer = useFragment(Transfer, props.transfer);

  return (
    <ListItem
      leading={(props) => <TokenIcon token={transfer.token} {...props} />}
      leadingSize="medium"
      headline={`Transfer from ${useAddressLabel(
        asUAddress(transfer.from, transfer.account.chain),
      )}`}
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
}

export const IncomingTransferItem = withSuspense(
  IncomingTransferItem_,
  <ListItemSkeleton leading supporting />,
);
