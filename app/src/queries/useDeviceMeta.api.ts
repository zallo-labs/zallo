import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { Address } from 'lib';
import { useMemo } from 'react';
import { DeviceMetaDocument, DeviceMetaQuery, DeviceMetaQueryVariables } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export interface DeviceMeta {
  address: Address;
  name?: string;
}

gql`
  query DeviceMeta($addr: Address) {
    device(addr: $addr) {
      id
      name
    }
  }
`;

export const useDeviceMeta = (addr?: Address) => {
  const device = useDevice();

  const { data } = useSuspenseQuery<DeviceMetaQuery, DeviceMetaQueryVariables>(DeviceMetaDocument, {
    client: useApiClient(),
    variables: { addr },
  });

  return useMemo(
    (): DeviceMeta => ({
      address: device.address,
      name: data.device?.name || undefined,
    }),
    [data.device?.name, device.address],
  );
};
