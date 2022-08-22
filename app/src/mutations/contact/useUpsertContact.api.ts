import { useCallback } from 'react';
import { gql, useMutation } from '@apollo/client';
import {
  ContactsDocument,
  ContactsQuery,
  ContactsQueryVariables,
  UpsertContactMutation,
  UpsertContactMutationVariables,
  useUpsertContactMutation,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import {
  API_CONTACTS_QUERY,
  API_CONTACT_FIELDS,
  Contact,
  NewContact,
} from '~/queries/contacts/useContacts.api';
import { useDevice } from '@features/device/useDevice';
import { toId } from 'lib';
import { QueryOpts } from '@gql/update';
import produce from 'immer';

const API_MUTATION = gql`
  ${API_CONTACT_FIELDS}

  mutation UpsertContact(
    $prevAddr: Address
    $newAddr: Address!
    $name: String!
  ) {
    upsertContact(prevAddr: $prevAddr, newAddr: $newAddr, name: $name) {
      ...ContactFields
    }
  }
`;

export const useUpsertContact = () => {
  const device = useDevice();

  const [mutation] = useUpsertContactMutation({ client: useApiClient() });

  const upsert = useCallback(
    (cur: NewContact, prev?: Contact) => {
      const curId = toId(`${device.address}-${cur.addr}`);

      return mutation({
        variables: {
          prevAddr: prev?.addr,
          newAddr: cur.addr,
          name: cur.name,
        },
        optimisticResponse: {
          upsertContact: {
            __typename: 'Contact',
            id: curId,
            ...cur,
          },
        },
        update: (cache, res) => {
          const contact = res?.data?.upsertContact;
          if (!contact) return;

          const opts: QueryOpts<ContactsQueryVariables> = {
            query: ContactsDocument,
            variables: {},
          };

          const data = cache.readQuery<ContactsQuery>(opts) ?? { contacts: [] };

          // Insert into query list
          if (!data.contacts.find((c) => c.id === curId)) {
            cache.writeQuery<ContactsQuery>({
              query: API_CONTACTS_QUERY,
              data: produce(data, (data) => {
                data.contacts.push(contact);
              }),
            });
          }

          // Evict previous contact if ID has changed
          if (prev && prev.id !== contact.id) {
            cache.evict({
              id: cache.identify({
                __typename: 'Contact',
                ...prev,
              }),
            });
          }
        },
      });
    },
    [mutation, device.address],
  );

  return upsert;
};
