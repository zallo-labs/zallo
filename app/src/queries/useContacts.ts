import { useQuery } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { GetContacts } from '@gql/api.generated';
import { apiGql } from '@gql/clients';
import { useApiClient } from '@gql/GqlProvider';
import { truncatedAddr } from '@util/hook/useAddrName';
import { address, Address, filterFirstUnique, Id, toId } from 'lib';
import { useMemo } from 'react';
import { useSafes } from './useSafes';

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
  const { safes } = useSafes();
  const wallet = useWallet();

  const { data, ...rest } = useQuery<GetContacts>(API_CONTACTS_QUERY, {
    client: useApiClient(),
  });

  const contacts: Contact[] = useMemo(
    () =>
      data?.contacts.map((c) => ({
        id: toId(c.id),
        addr: address(c.addr),
        name: c.name,
      })) ?? [],
    [data],
  );

  // Show this device & other safes as contacts
  const safeContacts = safes.map(
    ({ name, safe: { address } }): Contact => ({
      id: toId(address),
      addr: address,
      name: name ?? truncatedAddr(address),
    }),
  );

  const thisDeviceContact: Contact = {
    id: toId(wallet.address),
    addr: wallet.address,
    name: 'Myself',
  };

  // Exclude created safes & wallet contacts if they're already in the list
  const combinedContacts = filterFirstUnique(
    [...contacts, ...safeContacts, thisDeviceContact],
    (contact) => contact.id,
  );

  return { contacts: combinedContacts, ...rest };
};

export interface NewContact {
  addr: Address;
  name: string;
}

export interface Contact extends NewContact {
  id: Id;
}
