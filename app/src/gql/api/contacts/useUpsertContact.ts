import { useCallback } from 'react';
import { gql } from '@apollo/client';
import {
  ContactFieldsFragmentDoc,
  ContactsDocument,
  ContactsQuery,
  ContactsQueryVariables,
  useUpsertContactMutation,
} from '@api/generated';
import { Contact, NewContact } from './types';
import { updateQuery } from '~/gql/util';
import { useUser } from '@api/user';

gql`
  ${ContactFieldsFragmentDoc}

  mutation UpsertContact($name: String!, $newAddr: Address!, $prevAddr: Address) {
    upsertContact(name: $name, prevAddr: $prevAddr, newAddr: $newAddr) {
      ...ContactFields
    }
  }
`;

export const useUpsertContact = () => {
  const user = useUser();
  const [mutation] = useUpsertContactMutation();

  return useCallback(
    (cur: NewContact, prev?: Contact) => {
      return mutation({
        variables: {
          prevAddr: prev?.address,
          newAddr: cur.address,
          name: cur.name,
        },
        optimisticResponse: {
          upsertContact: {
            __typename: 'ContactObject',
            id: `${user.id}-${cur.address}`,
            addr: cur.address,
            name: cur.name,
          },
        },
        update: async (cache, res) => {
          const contact = res?.data?.upsertContact;
          if (!contact) return;

          // Contacts: insert new contact or remove existing
          if (prev?.address !== contact.addr) {
            await updateQuery<ContactsQuery, ContactsQueryVariables>({
              cache,
              query: ContactsDocument,
              variables: {},
              defaultData: { contacts: [] },
              updater: (data) => {
                if (prev) {
                  data.contacts = data.contacts.filter((c) => c.id !== prev.id);
                } else if (!data.contacts.find((c) => c.id === contact.id)) {
                  data.contacts.push(contact);
                }
              },
            });
          }
        },
      });
    },
    [user.id, mutation],
  );
};
