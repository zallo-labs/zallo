import { gql, useQuery } from '@apollo/client';
import { useDevice } from '@features/device/useDevice';
import { ContactsQuery } from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { truncatedAddr } from '@util/format';
import { address, Address, filterFirst, Id, toId } from 'lib';
import { useMemo } from 'react';
import { useAccountIds } from '../account/useAccountIds';

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
  const device = useDevice();
  // const accountIds = useAccountIds();

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

  // Show this device & other accounts as contacts
  // const accountContacts = useMemo(
  //   () =>
  //     accounts.map(
  //       ({ name, contract: { address } }): Contact => ({
  //         id: toId(address),
  //         addr: address,
  //         name: name || `Account ${truncatedAddr(address)}`,
  //       }),
  //     ),
  //   [accounts],
  // );
  // TODO: fix showing user accounts as contacts
  const accountContacts: Contact[] = [];

  // Exclude created accounts & wallet contacts if they're already in the list
  const combinedContacts = useMemo(() => {
    const thisDeviceContact: Contact = {
      id: toId(device.address),
      addr: device.address,
      name: 'Myself',
    };

    return filterFirst(
      [...contacts, ...accountContacts, thisDeviceContact],
      (contact) => contact.addr,
    );
  }, [contacts, accountContacts, device.address]);

  return { contacts: combinedContacts, ...rest };
};

export interface NewContact {
  addr: Address;
  name: string;
}

export interface Contact extends NewContact {
  id: Id;
}
