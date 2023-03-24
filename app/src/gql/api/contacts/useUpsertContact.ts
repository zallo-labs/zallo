import { useCallback } from 'react';
import { gql } from '@apollo/client';
import {
  ContactsDocument,
  ContactsQuery,
  ContactsQueryVariables,
  useUpsertContactMutation,
} from '@api/generated';
import { Contact, NewContact } from './types';
import { toId } from 'lib';
import { updateQuery } from '~/gql/util';
import { useUser } from '@api/user';

gql`
  mutation UpsertContact($name: String!, $newAddr: Address!, $prevAddr: Address) {
    upsertContact(name: $name, prevAddr: $prevAddr, newAddr: $newAddr) {
      id
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
            id: toId(`${user.id}-${cur.address}`),
          },
        },
        update: (cache, res) => {
          const id = res?.data?.upsertContact.id;
          if (!id) return;

          // Contacts: upsert contact and remove prior
          updateQuery<ContactsQuery, ContactsQueryVariables>({
            cache,
            query: ContactsDocument,
            variables: {},
            defaultData: { contacts: [] },
            updater: (data) => {
              // Upsert current contact, or replace prev if the id has changed
              const i = data.contacts.findIndex(
                prev && prev.address !== cur.address ? (c) => c.id === prev.id : (c) => c.id === id,
              );
              data.contacts[i >= 0 ? i : data.contacts.length] = {
                __typename: 'ContactObject',
                id,
                addr: cur.address,
                name: cur.name,
              };
            },
          });
        },
      });
    },
    [user.id, mutation],
  );
};
