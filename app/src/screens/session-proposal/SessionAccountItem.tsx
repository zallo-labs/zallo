import { Address } from 'lib';
import { Checkbox } from 'react-native-paper';
import { ListItem, ListItemProps } from '~/components/list/ListItem';
import { AddressLabel } from '~/components/address/AddressLabel';

export interface SessionAccountItemProps extends Partial<ListItemProps> {
  account: Address;
  onPress: ListItemProps['onPress'];
}

export const SessionAccountItem = ({
  account,
  selected,
  onPress,
  ...itemProps
}: SessionAccountItemProps) => {
  return (
    <ListItem
      leading={account}
      headline={<AddressLabel address={account} />}
      selected={selected}
      trailing={<Checkbox status={selected ? 'checked' : 'unchecked'} onPress={onPress} />}
      {...itemProps}
    />
  );
};
