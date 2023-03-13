import { buildAddrLink } from '~/util/addrLink';
import { ShareIcon, DeleteIcon } from '~/util/theme/icons';
import { Share } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { Contact, useDeleteContact } from '@api/contacts';
import { useRootNavigation } from '~/navigation/useRootNavigation';

export interface ContactAppbarProps {
  existing?: Contact;
}

export const ContactAppbar = ({ existing }: ContactAppbarProps) => {
  const navigation = useRootNavigation();
  const remove = useDeleteContact();

  return (
    <Appbar.Header mode="large">
      <Appbar.BackAction onPress={useGoBack()} />

      <Appbar.Content title="Contact" />

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
