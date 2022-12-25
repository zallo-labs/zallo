import { useCallback } from 'react';
import { gql } from '@apollo/client';
import {
  ContactsDocument,
  ContactsQuery,
  ContactsQueryVariables,
  useUpsertContactMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { Contact, NewContact } from '~/queries/contacts/useContacts.api';
import { toId } from 'lib';
import { updateQuery } from '~/gql/update';
import { useUser } from '~/queries/useUser.api';

gql`
  mutation UpsertContact($name: String!, $newAddr: Address!, $prevAddr: Address) {
    upsertContact(name: $name, prevAddr: $prevAddr, newAddr: $newAddr) {
      id
    }
  }
`;

export const useUpsertContact = () => {
  const user = useUser();

  const [mutation] = useUpsertContactMutation({ client: useApiClient() });

  return useCallback(
    (cur: NewContact, prev?: Contact) => {
      return mutation({
        variables: {
          prevAddr: prev?.addr,
          newAddr: cur.addr,
          name: cur.name,
        },
        optimisticResponse: {
          upsertContact: {
            id: toId(`${user.id}-${cur.addr}`),
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
              // Remove previous contact if the address has changed
              if (prev && prev.addr !== cur.addr) {
                data.contacts = data.contacts.filter((c) => c.addr !== prev.addr);
              }

              // Upsert current contact
              const i = data.contacts.findIndex((c) => c.id === id);
              data.contacts[i >= 0 ? i : data.contacts.length] = {
                id,
                addr: cur.addr,
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
