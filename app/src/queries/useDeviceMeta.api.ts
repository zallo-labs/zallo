import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { Address } from 'lib';
import { useMemo } from 'react';
import { useDeviceMetaQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import * as Device from 'expo-device';
import { truncateAddr } from '~/util/format';

export interface DeviceMeta {
  address: Address;
  name: string;
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

  const { data } = useDeviceMetaQuery({
    client: useApiClient(),
    variables: { addr },
  });

  return useMemo(
    (): DeviceMeta => ({
      address: device.address,
      name: data?.device?.name || Device.deviceName || truncateAddr(device.address),
    }),
    [data?.device?.name, device.address],
  );
};
