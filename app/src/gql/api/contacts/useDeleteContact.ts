import { gql, useMutation } from '@apollo/client';
import {
  DeleteContactMutation,
  DeleteContactMutationVariables,
  DeleteContactDocument,
} from '@api/generated';
import { useCallback } from 'react';
import { Contact } from './types';

gql`
  mutation DeleteContact($input: ContactInput!) {
    deleteContact(input: $input)
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
          input: { address: contact.address },
        },
        optimisticResponse: {
          deleteContact: contact.id,
        },
        update: (cache, res) => {
          const id = res.data?.deleteContact;
          if (id) {
            cache.evict({ id });
            cache.gc();
          }
        },
      }),
    [mutation],
  );
};
