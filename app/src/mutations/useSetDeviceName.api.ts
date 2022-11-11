import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { useCallback } from 'react';
import {
  DeviceMetaDocument,
  DeviceMetaQuery,
  DeviceMetaQueryVariables,
  useSetDeviceNameMutation,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { updateQuery } from '~/gql/update';

gql`
  mutation SetDeviceName($name: String) {
    setDeviceName(name: $name) {
      id
    }
  }
`;

export const useSetDeviceName = () => {
  const device = useDevice();

  const [mutate] = useSetDeviceNameMutation({
    client: useApiClient(),
  });

  return useCallback(
    (name: string) =>
      mutate({
        variables: { name },
        optimisticResponse: {
          setDeviceName: {
            id: device.address,
          },
        },
        update: (cache, res) => {
          if (!res.data?.setDeviceName.id) return;

          updateQuery<DeviceMetaQuery, DeviceMetaQueryVariables>({
            cache,
            query: DeviceMetaDocument,
            variables: {},
            defaultData: {
              device: {
                id: device.address,
              },
            },
            updater: (data) => {
              if (data.device) data.device.name = name;
            },
          });
        },
      }),
    [device, mutate],
  );
};
