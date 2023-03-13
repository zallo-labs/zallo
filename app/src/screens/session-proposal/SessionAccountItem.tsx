import { Address } from 'lib';
import { Checkbox, Text } from 'react-native-paper';
import { AddrIcon } from '~/components/Identicon/AddrIcon';
import { Item, ItemProps } from '~/components/item/Item';
import { ItemSkeleton } from '~/components/item/ItemSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { useAccount } from '@api/account';

export interface SessionAccountItemProps extends Omit<ItemProps, 'selected'> {
  account: Address;
  selected?: QuorumKey;
  onSelect: (quorumKey: QuorumKey | undefined) => void;
}

const SessionAccountItem = ({
  account: accountAddr,
  selected,
  onSelect,
  ...itemProps
}: SessionAccountItemProps) => {
  const account = useAccount(accountAddr);
  const selectQuorum = useSelectQuorum(accountAddr);
  const selectedQuorum = useQuorum(selected ? { account: accountAddr, key: selected } : undefined);

  return (
    <Item
      Left={<AddrIcon addr={accountAddr} />}
      Main={[
        <Text variant="titleLarge">{account.name}</Text>,
        selectedQuorum && <Text variant="bodyMedium">{selectedQuorum.name}</Text>,
      ]}
      selected={!!selectedQuorum}
      Right={
        <Checkbox status={selected ? 'checked' : 'unchecked'} onPress={() => onSelect(undefined)} />
      }
      padding="vertical"
      onPress={async () => onSelect((await selectQuorum()).key)}
      {...itemProps}
    />
  );
};

export default withSkeleton(SessionAccountItem, ItemSkeleton);
