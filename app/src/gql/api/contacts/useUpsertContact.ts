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

gql`
  ${ContactFieldsFragmentDoc}

  mutation UpsertContact($input: UpsertContactInput!) {
    upsertContact(input: $input) {
      ...ContactFields
    }
  }
`;

export const useUpsertContact = () => {
  const [mutation] = useUpsertContactMutation();

  return useCallback(
    (cur: NewContact, prev?: Contact) => {
      return mutation({
        variables: {
          input: {
            previousAddress: prev?.address,
            address: cur.address,
            label: cur.label,
          },
        },
        optimisticResponse: {
          upsertContact: {
            __typename: 'Contact',
            id: cur.address,
            address: cur.address,
            label: cur.label,
          },
        },
        update: async (cache, res) => {
          const contact = res?.data?.upsertContact;
          if (!contact) return;

          // Contacts: insert new contact or remove existing
          if (prev?.address !== contact.address) {
            await updateQuery<ContactsQuery, ContactsQueryVariables>({
              cache,
              query: ContactsDocument,
              variables: {},
              defaultData: { contacts: [] },
              updater: (data) => {
                if (prev) {
                  data.contacts = data.contacts.filter((c) => c.address !== prev.address);
                } else if (!data.contacts.find((c) => c.address === contact.address)) {
                  data.contacts.push(contact);
                }
              },
            });
          }
        },
      });
    },
    [mutation],
  );
};
