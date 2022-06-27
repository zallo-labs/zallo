import { AppbarBack } from '@components/AppbarBack';
import { AppbarRoot } from '@components/AppbarRoot';
import { useNavigation } from '@react-navigation/native';
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
    <AppbarRoot>
      <AppbarBack />

      {/* Search */}

      <Appbar.Action
        icon="line-scan"
        onPress={() =>
          navigation.navigate('QrScanner', {
            target: { route: 'Contacts', output: 'scanned' },
          })
        }
      />
    </AppbarRoot>
  );
};
