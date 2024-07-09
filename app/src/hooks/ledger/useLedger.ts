import { Address } from 'lib';
import { err } from 'neverthrow';
import { DeviceId } from 'react-native-ble-plx';
import { useMemo } from 'react';
import { persistedAtom } from '~/lib/persistedAtom';
import { useAtomValue } from 'jotai';
import { connectLedger } from './connectLedger';
import useBluetoothPermissions from '~/hooks/ble/useBluetoothPermissions';
import { useObservable } from '~/hooks/useObservable';
import { graphql } from 'relay-runtime';
import { useLedger_approver$key } from '~/api/__generated__/useLedger_approver.graphql';
import { useFragment } from 'react-relay';

const UserApprover = graphql`
  fragment useLedger_approver on Approver {
    id
    address
    details @required(action: THROW) {
      id
      bluetoothDevices
    }
  }
`;

export const APPROVER_BLE_IDS = persistedAtom<Record<Address, DeviceId[]>>('approverBleIds', {});

export function useLedger(device: DeviceId | useLedger_approver$key) {
  const [hasPermission, requestPermissions] = useBluetoothPermissions();

  const approver = useFragment(UserApprover, typeof device !== 'string' ? device : null);
  const approverBleIds = useAtomValue(APPROVER_BLE_IDS);

  const result =
    useObservable(
      useMemo(() => {
        if (!hasPermission) return null;

        const deviceIds = approver
          ? [
              ...(approverBleIds[approver.address] ?? []),
              ...(approver?.details?.bluetoothDevices ?? []),
            ]
          : [device as string];

        return connectLedger(deviceIds);
      }, [hasPermission, approver, approverBleIds, device]),
    ) ?? err('finding' as const);

  return hasPermission
    ? result
    : err({ type: 'permissions-required' as const, requestPermissions });
}
