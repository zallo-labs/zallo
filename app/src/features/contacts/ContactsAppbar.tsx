import { AppbarBack } from '@components/AppbarBack';
import { useNavigation } from '@react-navigation/native';
import { ScanIcon } from '@util/icons';
import { Address } from 'lib';
import { Appbar } from 'react-native-paper';
import { ContactsScreenProps } from './ContactsScreen';

export interface ContactsAppbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  select: (addr: Address) => void;
}

export const ContactsAppbar = ({
  search,
  onSearchChange,
  select,
}: ContactsAppbarProps) => {
  const navigation = useNavigation<ContactsScreenProps['navigation']>();

  return (
    <Appbar.Header>
      <AppbarBack />

      {/* Search */}

      <Appbar.Action
        icon={ScanIcon}
        onPress={() =>
          navigation.navigate('QrScanner', {
            target: { route: 'Contacts', output: 'scanned' },
          })
        }
      />
    </Appbar.Header>
  );
};
