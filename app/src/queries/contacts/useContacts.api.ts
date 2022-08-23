import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { useContactsQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { truncatedAddr } from '~/util/format';
import { address, Address, filterFirst, Id, toId } from 'lib';
import { useMemo } from 'react';
import { useApiUserAccountsMetadata } from '../account/useAccountsMetadata.api';

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
  const { apiAccountsMetadata } = useApiUserAccountsMetadata();

  const { data, ...rest } = useContactsQuery({ client: useApiClient() });

  const contacts = useMemo(() => {
    // Include this device, and associated accounts as contacts if they aren't already
    const remote: Contact[] =
      data?.contacts.map((c) => ({
        id: toId(c.id),
        addr: address(c.addr),
        name: c.name,
      })) ?? [];

    const accountContacts = apiAccountsMetadata.map(
      ({ id, addr, name }): Contact => ({
        id: id,
        addr: addr,
        name: name || `Account ${truncatedAddr(addr)}`,
      }),
    );

    const thisDevice: Contact = {
      id: toId(device.address),
      addr: device.address,
      name: 'This device',
    };

    return filterFirst(
      [...remote, ...accountContacts, thisDevice],
      (c) => c.addr,
    );
  }, [apiAccountsMetadata, data?.contacts, device.address]);

  return { contacts, ...rest };
};

export interface NewContact {
  addr: Address;
  name: string;
}

export interface Contact extends NewContact {
  id: Id;
}
