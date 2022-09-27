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
import { useDevice } from '@network/useDevice';
import { toId } from 'lib';
import { QueryOpts } from '~/gql/update';
import produce from 'immer';

gql`
  mutation UpsertContact(
    $name: String!
    $newAddr: Address!
    $prevAddr: Address
  ) {
    upsertContact(name: $name, prevAddr: $prevAddr, newAddr: $newAddr) {
      id
    }
  }
`;

export const useUpsertContact = () => {
  const device = useDevice();

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
            id: toId(`${device.address}-${cur.addr}`),
          },
        },
        update: (cache, res) => {
          const id = res?.data?.upsertContact.id;
          if (!id) return;

          // Contacts: upsert contact and remove prior
          const opts: QueryOpts<ContactsQueryVariables> = {
            query: ContactsDocument,
            variables: {},
          };

          const data = cache.readQuery<ContactsQuery>(opts) ?? { contacts: [] };

          cache.writeQuery<ContactsQuery>({
            ...opts,
            overwrite: true,
            data: produce(data, (data) => {
              // Remove previous contact if the address has changed
              if (prev && prev.addr !== cur.addr) {
                data.contacts = data.contacts.filter(
                  (c) => c.addr !== prev.addr,
                );
              }

              // Upsert current contact
              const contact = {
                id,
                addr: cur.addr,
                name: cur.name,
              };
              const i = data.contacts.findIndex((c) => c.id === id);
              if (i >= 0) {
                data.contacts[i] = contact;
              } else {
                data.contacts.push(contact);
              }
            }),
          });
        },
      });
    },
    [mutation, device.address],
  );
};
