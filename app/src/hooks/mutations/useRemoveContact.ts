import { useFragment } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import { useRemoveContact_contact$key } from '~/api/__generated__/useRemoveContact_contact.graphql';
import { useRemoveContact_query$key } from '~/api/__generated__/useRemoveContact_query.graphql';
import {
  useRemoveContactMutation,
  useRemoveContactMutation$data,
} from '~/api/__generated__/useRemoveContactMutation.graphql';
import { useRemoveContactUpdatableQuery } from '~/api/__generated__/useRemoveContactUpdatableQuery.graphql';

graphql`
  fragment useRemoveContact_assignable_contact on Contact @assignable {
    __typename
  }
`;

export interface RemoveContactParams {
  query: useRemoveContact_query$key;
  contact: useRemoveContact_contact$key | null | undefined;
}

export function useRemoveContact(params: RemoveContactParams) {
  const { contacts } = useFragment(
    graphql`
      fragment useRemoveContact_query on Query {
        contacts(input: { query: null }) {
          id
          ...useRemoveContact_assignable_contact
        }
      }
    `,
    params.query,
  );

  const contact = useFragment(
    graphql`
      fragment useRemoveContact_contact on Contact {
        id
        address
      }
    `,
    params.contact,
  );

  const commit = useMutation<useRemoveContactMutation>(graphql`
    mutation useRemoveContactMutation($address: UAddress!) @raw_response_type {
      deleteContact(address: $address) @deleteRecord
    }
  `);

  if (!contact) return undefined;

  const updater: SelectorStoreUpdater<useRemoveContactMutation$data> = (store, data) => {
    if (!data?.deleteContact) return;

    const { updatableData } = store.readUpdatableQuery<useRemoveContactUpdatableQuery>(
      graphql`
        query useRemoveContactUpdatableQuery @updatable {
          contacts(input: { query: null }) {
            ...useRemoveContact_assignable_contact
          }
        }
      `,
      {},
    );
    updatableData.contacts = contacts.filter((c) => c.id !== data.deleteContact);
  };

  return () =>
    commit(
      { address: contact.address },
      {
        optimisticResponse: { deleteContact: contact.id },
        optimisticUpdater: updater,
        updater,
      },
    );
}
