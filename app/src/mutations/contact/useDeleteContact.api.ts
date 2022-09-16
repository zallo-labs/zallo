import { gql, useMutation } from '@apollo/client';
import {
  DeleteContactMutation,
  DeleteContactMutationVariables,
  ContactsQuery,
  DeleteContactDocument,
  ContactsQueryVariables,
  ContactsDocument,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { useCallback } from 'react';
import { Contact } from '~/queries/contacts/useContacts.api';
import { QueryOpts } from '~/gql/update';

gql`
  mutation DeleteContact($addr: Address!) {
    deleteContact(addr: $addr)
  }
`;

export const useDeleteContact = () => {
  const [mutation] = useMutation<
    DeleteContactMutation,
    DeleteContactMutationVariables
  >(DeleteContactDocument, {
    client: useApiClient(),
  });

  return useCallback(
    (contact: Contact) =>
      mutation({
        variables: {
          addr: contact.addr,
        },
        optimisticResponse: {
          deleteContact: true,
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
              contacts: data.contacts.filter((c) => c.addr !== contact.addr),
            },
          });
        },
      }),
    [mutation],
  );
};
