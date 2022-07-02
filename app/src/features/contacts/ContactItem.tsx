import { Subheading, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Address } from 'lib';
import { Addr } from '@components/Addr';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps } from '@components/list/Item';
import { Contact } from '~/queries';
import { ContactsScreenProps } from './ContactsScreen';
import { EditIcon } from '@util/icons';

export interface ContactItemProps extends ItemProps {
  contact: Contact;
  select?: (addr: Address) => void;
  disabled?: boolean;
}

export const ContactItem = ({
  contact,
  select,
  disabled,
  ...itemProps
}: ContactItemProps) => {
  const { colors, iconSize } = useTheme();
  const navigation = useNavigation<ContactsScreenProps['navigation']>();

  return (
    <Item
      Left={<Identicon seed={contact.addr} />}
      Main={
        <Subheading>
          <Addr addr={contact.addr} />
        </Subheading>
      }
      Right={
        <EditIcon
          size={iconSize.small}
          color={colors.onSurface}
          onPress={() => navigation.navigate('Contact', { addr: contact.addr })}
        />
      }
      onPress={select ? () => select(contact.addr) : undefined}
      disabled={disabled}
      {...itemProps}
    />
  );
};
