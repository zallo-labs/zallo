import { gql } from '@apollo/client';
import { ContactsDocument, ContactsQuery, ContactsQueryVariables } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { address, Address, Id, toId } from 'lib';
import { useMemo } from 'react';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';

export interface NewContact {
  addr: Address;
  name: string;
}

export interface Contact extends NewContact {
  id: Id;
}

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
    {
      client: useApiClient(),
      variables: {},
    },
  );
  usePollWhenFocussed(rest, 120);

  const contacts = useMemo(
    (): Contact[] =>
      data.contacts.map((c) => ({
        id: toId(c.id),
        addr: address(c.addr),
        name: c.name,
      })),
    [data.contacts],
  );

  return [contacts, rest] as const;
};
