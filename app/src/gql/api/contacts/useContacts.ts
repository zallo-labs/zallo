import { gql } from '@apollo/client';
import { ContactsDocument, ContactsQuery, ContactsQueryVariables } from '@api/generated';
import { asAddress, toId } from 'lib';
import { useMemo } from 'react';
import { useSuspenseQuery, usePollWhenFocussed } from '~/gql/util';
import { Contact } from './types';

gql`
  fragment ContactFields on ContactObject {
    id
    addr
    name
  }

  query Contacts {
    contacts {
      ...ContactFields
    }
  }
`;

export const useContacts = () => {
  const { data, ...rest } = useSuspenseQuery<ContactsQuery, ContactsQueryVariables>(
    ContactsDocument,
    { variables: {} },
  );
  usePollWhenFocussed(rest, 120);

  return useMemo(
    (): Contact[] =>
      data.contacts.map((c) => ({
        id: toId(c.id),
        addr: asAddress(c.addr),
        name: c.name,
      })),
    [data.contacts],
  );
};
