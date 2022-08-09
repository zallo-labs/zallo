import { Box } from '@components/Box';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps } from '@components/list/Item';
import { ItemSkeleton } from '@components/list/ItemSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { truncatedAddr } from '@util/format';
import { useAddrName } from '@util/hook/useAddrName';
import { Caption, Title } from 'react-native-paper';
import { CombinedAccount } from '~/queries/wallets';

export interface AccountItemProps extends ItemProps {
  account: CombinedAccount;
}

export const AccountItem = withSkeleton(
  ({
    account: { contract: account, name: givenName },
    ...itemProps
  }: AccountItemProps) => {
    const addrName = useAddrName(account.address);
    const name = givenName || addrName;

    return (
      <Item
        Left={<Identicon seed={account.address} />}
        leftContainer={{ marginLeft: 1 }}
        Main={
          <Box vertical justifyContent="center">
            <Title style={{ marginTop: 0, marginBottom: 0 }}>{name}</Title>
            <Caption style={{ marginTop: 0, marginBottom: 0 }}>
              {truncatedAddr(account.address)}
            </Caption>
          </Box>
        }
        {...itemProps}
      />
    );
  },
  ItemSkeleton,
);
