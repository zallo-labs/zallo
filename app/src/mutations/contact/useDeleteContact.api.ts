import { gql, useMutation } from '@apollo/client';
import {
  DeleteContactMutation,
  DeleteContactMutationVariables,
  ContactsQuery,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { useCallback } from 'react';
import {
  Contact,
  API_CONTACTS_QUERY,
} from '~/queries/contacts/useContacts.api';

const API_MUTATION = gql`
  mutation DeleteContact($addr: Address!) {
    deleteContact(addr: $addr) {
      id
    }
  }
`;

export const useDeleteContact = () => {
  const [mutation] = useMutation<
    DeleteContactMutation,
    DeleteContactMutationVariables
  >(API_MUTATION, { client: useApiClient() });

  const del = useCallback(
    (contact: Contact) =>
      mutation({
        variables: {
          addr: contact.addr,
        },
        optimisticResponse: {
          deleteContact: {
            __typename: 'DeleteContactResp',
            id: contact.id,
          },
        },
        update: (cache) => {
          // Remove from query list
          const data = cache.readQuery<ContactsQuery>({
            query: API_CONTACTS_QUERY,
          });

          cache.writeQuery<ContactsQuery>({
            query: API_CONTACTS_QUERY,
            overwrite: true,
            data: {
              contacts: (data?.contacts ?? []).filter(
                (c) => c.id !== contact.id,
              ),
            },
          });
        },
      }),
    [mutation],
  );

  return del;
};
