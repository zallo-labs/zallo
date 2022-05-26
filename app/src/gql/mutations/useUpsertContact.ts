import { useCallback } from 'react';
import { useMutation } from '@apollo/client';

import { apiGql } from '@gql/clients';
import {
  GetContacts,
  UpsertContact,
  UpsertContactVariables,
} from '@gql/api.generated';
import { useApiClient } from '@gql/GqlProvider';
import {
  API_CONTACTS_QUERY,
  API_CONTACT_FIELDS,
  Contact,
  NewContact,
} from '@gql/queries/useContacts';
import { useWallet } from '@features/wallet/useWallet';
import { toId } from 'lib';

const API_MUTATION = apiGql`
${API_CONTACT_FIELDS}

mutation UpsertContact($prevAddr: String, $newAddr: String!, $name: String!) {
  upsertContact(prevAddr: $prevAddr, newAddr: $newAddr, name: $name) {
    ...ContactFields
  }
}
`;

export const useUpsertContact = () => {
  const wallet = useWallet();

  const [mutation] = useMutation<UpsertContact, UpsertContactVariables>(
    API_MUTATION,
    {
      client: useApiClient(),
    },
  );

  const upsert = useCallback(
    (cur: NewContact, prev?: Contact) => {
      const curId = toId(`${wallet.address}-${cur.addr}`);

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
        update: (cache, { data: { upsertContact } }) => {
          const data: GetContacts = cache.readQuery({
            query: API_CONTACTS_QUERY,
          });

          // Insert into query list
          if (!data.contacts.map((c) => c.id).includes(upsertContact.id)) {
            const newData: GetContacts = {
              contacts: [...data.contacts, upsertContact],
            };
            cache.writeQuery({ query: API_CONTACTS_QUERY, data: newData });
          }

          // Evict previous contact if ID has changed
          if (prev && prev.id !== upsertContact.id) {
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
    [mutation, wallet.address],
  );

  return upsert;
};
