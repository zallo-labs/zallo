import { gql } from '@apollo/client';
import { ContactsDocument, ContactsQuery, ContactsQueryVariables } from '@api/generated';
import { useMemo } from 'react';
import { useSuspenseQuery } from '~/gql/util';
import { Contact } from './types';

gql`
  fragment ContactFields on Contact {
    id
    address
    name
  }

  query Contacts {
    contacts {
      ...ContactFields
    }
  }
`;

export const useContacts = () => {
  const { data } = useSuspenseQuery<ContactsQuery, ContactsQueryVariables>(ContactsDocument, {
    variables: {},
  });

  return useMemo(
    (): Contact[] =>
      data.contacts.map((c) => ({
        id: c.id,
        address: c.address,
        name: c.name,
      })),
    [data.contacts],
  );
};
