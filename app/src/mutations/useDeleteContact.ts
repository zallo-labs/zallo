import { useMutation } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import {
  DeleteContact,
  DeleteContactVariables,
  GetContacts,
} from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { API_CONTACTS_QUERY, Contact } from '~/queries';
import { toId } from 'lib';
import { useCallback } from 'react';

const API_MUTATION = apiGql`
mutation DeleteContact($addr: Address!) {
  deleteContact(addr: $addr) {
    id
  }
}
`;

export const useDeleteContact = () => {
  const wallet = useWallet();

  const [mutation] = useMutation<DeleteContact, DeleteContactVariables>(
    API_MUTATION,
    { client: useApiClient() },
  );

  const del = useCallback(
    (contact: Contact) =>
      mutation({
        variables: {
          addr: contact.addr,
        },
        optimisticResponse: {
          deleteContact: {
            __typename: 'DeleteContactResp',
            id: toId(`${wallet.address}-${contact.addr}`),
          },
        },
        update: (cache) => {
          // Remove from query list
          const data: GetContacts = cache.readQuery({
            query: API_CONTACTS_QUERY,
          });

          const newData: GetContacts = {
            contacts: data.contacts.filter((c) => c.id !== contact.id),
          };

          cache.writeQuery({
            query: API_CONTACTS_QUERY,
            data: newData,
            overwrite: true,
          });
        },
      }),
    [mutation, wallet.address],
  );

  return del;
};
