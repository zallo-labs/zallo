import { gql, useQuery } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import { ContactsQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { truncatedAddr } from '@util/format';
import { address, Address, filterFirst, Id, toId } from 'lib';
import { useMemo } from 'react';
import { useSafes } from './safe/useSafes';

export const API_CONTACT_FIELDS = gql`
  fragment ContactFields on Contact {
    id
    addr
    name
  }
`;

export const API_CONTACTS_QUERY = gql`
  ${API_CONTACT_FIELDS}

  query Contacts {
    contacts {
      ...ContactFields
    }
  }
`;

export const useContacts = () => {
  const { safes } = useSafes();
  const wallet = useWallet();

  const { data, ...rest } = useQuery<ContactsQuery>(API_CONTACTS_QUERY, {
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
  const safeContacts = useMemo(
    () =>
      safes.map(
        ({ name, safe: { address } }): Contact => ({
          id: toId(address),
          addr: address,
          name: name ?? `Safe ${truncatedAddr(address)}`,
        }),
      ),
    [safes],
  );

  // Exclude created safes & wallet contacts if they're already in the list
  const combinedContacts = useMemo(() => {
    const thisDeviceContact: Contact = {
      id: toId(wallet.address),
      addr: wallet.address,
      name: 'Myself',
    };

    return filterFirst(
      [...contacts, ...safeContacts, thisDeviceContact],
      (contact) => contact.addr,
    );
  }, [contacts, safeContacts, wallet.address]);

  return { contacts: combinedContacts, ...rest };
};

export interface NewContact {
  addr: Address;
  name: string;
}

export interface Contact extends NewContact {
  id: Id;
}
