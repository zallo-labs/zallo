import { useQuery } from '@apollo/client';
import { GetContacts } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { address, Address, Id, toId } from 'lib';
import { useMemo } from 'react';

export const API_CONTACT_FIELDS = apiGql`
fragment ContactFields on Contact {
  id
  addr
  name
}
`;

export const API_CONTACTS_QUERY = apiGql`
${API_CONTACT_FIELDS}

query GetContacts {
  contacts {
    ...ContactFields
  }
}
`;

export const useContacts = () => {
  const { data, ...rest } = useQuery<GetContacts>(API_CONTACTS_QUERY, {
    client: useApiClient(),
  });

  const contacts: Contact[] = useMemo(
    () =>
      data?.contacts2.map((c) => ({
        id: toId(c.id),
        addr: address(c.addr),
        name: c.name,
      })) ?? [],
    [data],
  );

  return { contacts, ...rest };
};

export interface NewContact {
  addr: Address;
  name: string;
}

export interface Contact extends NewContact {
  id: Id;
}
