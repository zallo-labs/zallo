import { useFragment } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import { useUpsertContact_query$key } from '~/api/__generated__/useUpsertContact_query.graphql';
import {
  UpsertContactInput,
  useUpsertContactMutation,
  useUpsertContactMutation$data,
} from '~/api/__generated__/useUpsertContactMutation.graphql';
import { useUpsertContactUpdatableQuery } from '~/api/__generated__/useUpsertContactUpdatableQuery.graphql';
import { randomUUID } from '~/lib/id';

graphql`
  fragment useUpsertContact_assignable_contact on Contact @assignable {
    __typename
  }
`;

export interface UpsertContactParams {
  query: useUpsertContact_query$key;
}

export function useUpsertContact(params: UpsertContactParams) {
  const { contacts } = useFragment(
    graphql`
      fragment useUpsertContact_query on Query {
        contacts(input: { query: null }) {
          address
          ...useUpsertContact_assignable_contact
        }
      }
    `,
    params.query,
  );

  const commit = useMutation<useUpsertContactMutation>(graphql`
    mutation useUpsertContactMutation($input: UpsertContactInput!) @raw_response_type {
      upsertContact(input: $input) {
        id
        address
        name
        ...useUpsertContact_assignable_contact
      }
    }
  `);

  const updater: SelectorStoreUpdater<useUpsertContactMutation$data> = (store, data) => {
    if (!data?.upsertContact) return;

    const { updatableData } = store.readUpdatableQuery<useUpsertContactUpdatableQuery>(
      graphql`
        query useUpsertContactUpdatableQuery($address: UAddress!) @updatable {
          contact(input: { address: $address }) {
            ...useUpsertContact_assignable_contact
          }

          contacts(input: { query: null }) {
            ...useUpsertContact_assignable_contact
          }
        }
      `,
      { address: data.upsertContact.address },
    );

    updatableData.contact = data.upsertContact;
    updatableData.contacts = [
      ...contacts.filter((c) => c.address !== data.upsertContact.address),
      data.upsertContact,
    ];
  };

  return (input: UpsertContactInput) =>
    commit(
      { input },
      {
        optimisticResponse: {
          upsertContact: {
            __typename: 'Contact',
            id: randomUUID(),
            address: input.address,
            name: input.name,
          },
        },
        optimisticUpdater: updater,
        updater,
      },
    );
}
