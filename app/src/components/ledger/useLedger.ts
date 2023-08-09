import { Address } from 'lib';
import { err } from 'neverthrow';
import { DeviceId } from 'react-native-ble-plx';
import useAsyncEffect from 'use-async-effect';
import { useState } from 'react';
import { persistedAtom } from '~/util/persistedAtom';
import { useAtomValue } from 'jotai';
import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import useBluetoothPermissions from './useBluetoothPermissions';
import { LedgerConnectEvent, connectLedger } from './connectLedger';

const UserApprover = gql(/* GraphQL */ `
  fragment UseLedger_UserApprover on UserApprover {
    id
    address
    bluetoothDevices
  }
`);

export const APPROVER_BLE_IDS = persistedAtom<Record<Address, DeviceId[]>>(
  'approverBleIds',
  {},
  { skipInitialPersist: true },
);

export function useLedger(device: DeviceId | FragmentType<typeof UserApprover>) {
  const [hasPermission, requestPermissions] = useBluetoothPermissions();

  const approver = typeof device !== 'string' ? getFragment(UserApprover, device) : undefined;
  const approverBleIds = useAtomValue(APPROVER_BLE_IDS);

  const [result, setResult] = useState<LedgerConnectEvent>(err('finding'));
  useAsyncEffect(
    async (isMounted) => {
      if (!hasPermission) return;

      const deviceIds = approver
        ? [...(approverBleIds[approver.address] ?? []), ...(approver?.bluetoothDevices ?? [])]
        : [device as string];

      const sub = connectLedger(deviceIds).subscribe((v) => {
        if (isMounted()) setResult(v);
      });

      return () => {
        sub.unsubscribe();
      };
    },
    (unmount) => unmount?.(),
    [hasPermission, approver, approverBleIds, device],
  );

  return hasPermission
    ? result
    : err({ type: 'permissions-required' as const, requestPermissions });
}
