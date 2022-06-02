import { Subheading, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Address } from 'lib';
import { Addr } from '@components/Addr';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps, SECONDARY_ICON_SIZE } from '@components/list/Item';
import { Contact } from '@queries';
import { ContactsScreenProps } from './ContactsScreen';

export interface ContactItemProps extends ItemProps {
  contact: Contact;
  select: (addr: Address) => void;
  disabled?: boolean;
}

export const ContactItem = ({
  contact,
  select,
  disabled,
  ...itemProps
}: ContactItemProps) => {
  const { colors } = useTheme();
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
        <MaterialIcons
          name="edit"
          size={SECONDARY_ICON_SIZE}
          color={colors.onSurface}
          onPress={() => navigation.navigate('Contact', { addr: contact.addr })}
        />
      }
      onPress={() => select(contact.addr)}
      disabled={disabled}
      {...itemProps}
    />
  );
};
