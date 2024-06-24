import { useAddressLabel } from '#/address/AddressLabel';
import { Timestamp } from '#/format/Timestamp';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { withSuspense } from '#/skeleton/withSuspense';
import { FiatValue } from '#/FiatValue';
import { FragmentType, gql, useFragment } from '@api/generated';
import { TokenIcon } from '../token/TokenIcon';
import { asUAddress } from 'lib';
import { createStyles } from '@theme/styles';
import { View } from 'react-native';
import Address from '~/app/(sheet)/select/address';
import { FilledIcon } from '#/FilledIcon';
import { ReceiveIcon } from '@theme/icons';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ICON_SIZE } from '@theme/paper';

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

export interface IncomingTransferItemProps extends Partial<ListItemProps> {
  transfer: FragmentType<typeof Transfer>;
}

function IncomingTransferItem_(props: IncomingTransferItemProps) {
  const transfer = useFragment(Transfer, props.transfer);

  return (
    <ListItem
      leading={
        <View>
          <AddressIcon address={transfer.from} />
          <FilledIcon
            icon={ReceiveIcon}
            size={(ICON_SIZE.medium * 10) / 24}
            style={styles.overlayed(ICON_SIZE.medium)}
          />
        </View>
      }
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
      {...props}
    />
  );
}

const styles = createStyles({
  overlayed: (size: number) => ({
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginTop: -size,
  }),
});

export const IncomingTransferItem = withSuspense(
  IncomingTransferItem_,
  <ListItemSkeleton leading supporting />,
);
