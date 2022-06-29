import { Box } from '@components/Box';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps } from '@components/list/Item';
import { ItemSkeleton } from '@components/list/ItemSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { truncatedAddr, useAddrName } from '@util/hook/useAddrName';
import { Caption, Title } from 'react-native-paper';
import { CombinedSafe } from '~/queries';

export interface SafeItemProps extends ItemProps {
  safe: CombinedSafe;
}

export const SafeItem = withSkeleton(
  ({ safe: { safe, name: givenName }, ...itemProps }: SafeItemProps) => {
    const addrName = useAddrName(safe.address);
    const name = givenName || addrName;

    return (
      <Item
        Left={<Identicon seed={safe.address} />}
        leftContainer={{ marginLeft: 1 }}
        Main={
          <Box vertical justifyContent="center">
            <Title style={{ marginTop: 0, marginBottom: 0 }}>{name}</Title>
            <Caption style={{ marginTop: 0, marginBottom: 0 }}>
              {truncatedAddr(safe.address)}
            </Caption>
          </Box>
        }
        {...itemProps}
      />
    );
  },
  ItemSkeleton,
);
