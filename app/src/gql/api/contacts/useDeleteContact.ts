import { gql, useMutation } from '@apollo/client';
import {
  DeleteContactMutation,
  DeleteContactMutationVariables,
  ContactsQuery,
  DeleteContactDocument,
  ContactsQueryVariables,
  ContactsDocument,
} from '@api/generated';
import { useCallback } from 'react';
import { QueryOpts } from '~/gql/util';
import { Contact } from './types';

gql`
  mutation DeleteContact($addr: Address!) {
    deleteContact(addr: $addr) {
      addr
    }
  }
`;

export const useDeleteContact = () => {
  const [mutation] = useMutation<DeleteContactMutation, DeleteContactMutationVariables>(
    DeleteContactDocument,
  );

  return useCallback(
    (contact: Contact) =>
      mutation({
        variables: {
          addr: contact.address,
        },
        optimisticResponse: {
          deleteContact: {
            __typename: 'Contact',
            addr: contact.address,
          },
        },
        update: (cache, res) => {
          if (!res.data?.deleteContact) return;

          // Contacts: remove contact
          const opts: QueryOpts<ContactsQueryVariables> = {
            query: ContactsDocument,
            variables: {},
          };

          const data = cache.readQuery<ContactsQuery>(opts);
          if (!data) return;

          cache.writeQuery<ContactsQuery>({
            ...opts,
            overwrite: true,
            data: {
              contacts: data.contacts.filter((c) => c.addr !== contact.address),
            },
          });
        },
      }),
    [mutation],
  );
};
