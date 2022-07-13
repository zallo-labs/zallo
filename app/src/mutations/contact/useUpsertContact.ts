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
} from '~/queries/useContacts';
import { useWallet } from '@features/wallet/useWallet';
import { toId } from 'lib';

const API_MUTATION = apiGql`
${API_CONTACT_FIELDS}

mutation UpsertContact($prevAddr: Address, $newAddr: Address!, $name: String!) {
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
        update: (cache, res) => {
          const contact = res?.data?.upsertContact;
          if (!contact) return;

          const data = cache.readQuery<GetContacts>({
            query: API_CONTACTS_QUERY,
          }) ?? { contacts: [] };

          // Insert into query list
          if (!data.contacts.map((c) => c.id).includes(contact.id)) {
            cache.writeQuery<GetContacts>({
              query: API_CONTACTS_QUERY,
              data: {
                contacts: [...data.contacts, contact],
              },
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
        optimisticResponse: {
          upsertContact: {
            __typename: 'Contact',
            id: curId,
            ...cur,
          },
        },
      });
    },
    [mutation, wallet.address],
  );

  return upsert;
};
