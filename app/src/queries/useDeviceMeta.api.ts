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
  query DeviceMeta {
    device {
      id
      name
    }
  }
`;

export const useDeviceMeta = () => {
  const device = useDevice();

  const { data } = useDeviceMetaQuery({
    client: useApiClient(),
    variables: {},
  });

  return useMemo(
    (): DeviceMeta => ({
      address: device.address,
      name: data?.device?.name || Device.deviceName || truncateAddr(device.address),
    }),
    [data?.device?.name, device.address],
  );
};
