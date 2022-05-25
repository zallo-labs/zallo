import { useMutation } from '@apollo/client';
import {
  DeleteContact,
  DeleteContactVariables,
  GetContacts,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { API_CONTACTS_QUERY, Contact } from '@queries';
import { useCallback } from 'react';

const API_MUTATION = apiGql`
mutation DeleteContact($addr: String!) {
  deleteContact(addr: $addr)
}
`;

export const useDeleteContact = () => {
  const [mutation] = useMutation<DeleteContact, DeleteContactVariables>(
    API_MUTATION,
    {
      client: useApiClient(),
    },
  );

  const del = useCallback(
    (contact: Contact) =>
      mutation({
        variables: {
          addr: contact.addr,
        },
        update: (cache, { data: { deleteContact } }) => {
          // Do nothing if the contact was not deleted
          if (!deleteContact) return;

          // Remove from query list
          const data: GetContacts = cache.readQuery({
            query: API_CONTACTS_QUERY,
          });

          const newData: GetContacts = {
            contacts: data.contacts.filter((c) => c.id !== contact.id),
          };
          cache.writeQuery({ query: API_CONTACTS_QUERY, data: newData });

          // Evict from cache
          cache.evict({
            id: cache.identify({
              __typename: 'Contact',
              ...contact,
            }),
          });
        },
      }),
    [mutation],
  );

  return del;
};
