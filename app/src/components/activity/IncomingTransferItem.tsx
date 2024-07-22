import { useAddressLabel } from '#/address/AddressLabel';
import { Timestamp } from '#/format/Timestamp';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { FiatValue } from '#/FiatValue';
import { asUAddress } from 'lib';
import { View } from 'react-native';
import { ReceiveIcon } from '@theme/icons';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { useTokenAmount } from '#/token/useTokenAmount';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { IncomingTransferItem_transfer$key } from '~/api/__generated__/IncomingTransferItem_transfer.graphql';
import { OverlayIcon } from '#/layout/OverlayIcon';
import { Link } from 'expo-router';

const Transfer = graphql`
  fragment IncomingTransferItem_transfer on Transfer {
    id
    account {
      id
      address
      chain
    }
    token {
      id
      ...useTokenAmount_token
    }
    from
    timestamp
    amount
    value
  }
`;

export interface IncomingTransferItemProps extends Partial<ListItemProps> {
  transfer: IncomingTransferItem_transfer$key;
}

function IncomingTransferItem_(props: IncomingTransferItemProps) {
  const transfer = useFragment(Transfer, props.transfer);
  const from = useAddressLabel(asUAddress(transfer.from, transfer.account.chain));
  const amount = useTokenAmount({ token: transfer.token, amount: transfer.amount });

  return (
    <Link
      href={{
        pathname: `/(nav)/[account]/(home)/activity/transfer/[id]`,
        params: { account: transfer.account.address, id: transfer.id },
      }}
      asChild
    >
      <ListItem
        leading={
          <View>
            <AddressIcon address={transfer.from} />
            <OverlayIcon icon={ReceiveIcon} />
          </View>
        }
        headline={`Received ${amount} from ${from}`}
        supporting={<Timestamp timestamp={transfer.timestamp} />}
        trailing={({ Text }) =>
          transfer.value !== null && transfer.value !== undefined ? (
            <Text variant="labelLarge">
              <FiatValue value={transfer.value} />
            </Text>
          ) : null
        }
        {...props}
      />
    </Link>
  );
}

export const IncomingTransferItem = withSuspense(
  IncomingTransferItem_,
  <ListItemSkeleton leading supporting />,
);
