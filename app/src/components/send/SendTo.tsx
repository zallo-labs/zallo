import { SelectableAddress } from '#/address/SelectableAddress';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { ContactsIcon } from '@theme/icons';
import { Chain } from 'chains';
import { asUAddress, isUAddress, UAddress } from 'lib';
import { useSelectAddress } from '~/hooks/useSelectAddress';

export interface SendToProps extends Partial<ListItemProps> {
  chain: Chain;
  to?: UAddress;
  onChange: (to?: UAddress) => void;
}

export function SendTo({ chain, to, onChange, ...props }: SendToProps) {
  const select = useSelectAddress();
  return (
    <ListItem
      leading={to ? <AddressIcon address={to} /> : ContactsIcon}
      overline="Recipient"
      headline={to ? <SelectableAddress address={to} /> : 'Send to'}
      onPress={async () => {
        const address = await select({
          chain,
          headline: 'Send to',
          include: ['accounts', 'contacts'],
        });
        if (address) onChange(isUAddress(address) ? address : asUAddress(address, chain));
      }}
      {...props}
    />
  );
}
