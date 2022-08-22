import { buildAddrLink } from '@features/qr/addrLink';
import { ShareIcon, DeleteIcon } from '@util/theme/icons';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useGoBack } from '~/components2/Appbar/useGoBack';
import { useDeleteContact } from '~/mutations/contact/useDeleteContact.api';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Contact } from '~/queries/contacts/useContacts.api';

export interface ContactAppbarProps {
  existing?: Contact;
}

export const ContactAppbar = ({ existing }: ContactAppbarProps) => {
  const navigation = useRootNavigation();
  const remove = useDeleteContact();

  return (
    <Appbar.Header mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title={`${existing ? 'Edit' : 'Create'} Contact`} />

      {existing && (
        <Appbar.Action
          icon={ShareIcon}
          onPress={() => {
            const link = buildAddrLink({
              target_address: existing.addr,
            });
            Share.share({
              message: `${existing.name}\n${link}`,
            });
          }}
        />
      )}

      {existing && (
        <Appbar.Action
          icon={DeleteIcon}
          onPress={() => {
            remove(existing);
            navigation.goBack();
          }}
        />
      )}
    </Appbar.Header>
  );
};
