import { Address } from 'lib';
import { Checkbox, Text } from 'react-native-paper';
import { AddrIcon } from '~/components/Identicon/AddrIcon';
import { Item, ItemProps } from '~/components/item/Item';
import { ItemSkeleton } from '~/components/item/ItemSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAccount } from '@api/account';

export interface SessionAccountItemProps extends Omit<ItemProps, 'selected'> {
  account: Address;
  selected?: boolean;
  onSelect: () => void;
}

const SessionAccountItem = ({
  account: accountAddr,
  selected,
  onSelect,
  ...itemProps
}: SessionAccountItemProps) => {
  const account = useAccount(accountAddr);

  return (
    <Item
      Left={<AddrIcon addr={accountAddr} />}
      Main={[<Text variant="titleLarge">{account.name}</Text>]}
      selected={selected}
      Right={<Checkbox status={selected ? 'checked' : 'unchecked'} onPress={() => onSelect()} />}
      padding="vertical"
      onPress={async () => onSelect()}
      {...itemProps}
    />
  );
};

export default withSkeleton(SessionAccountItem, ItemSkeleton);
