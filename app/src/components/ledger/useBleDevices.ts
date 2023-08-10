import { useState } from 'react';
import { err, ok } from 'neverthrow';
import useBluetoothPermissions from './useBluetoothPermissions';
import useAsyncEffect from 'use-async-effect';
import { BleDevice, SharedBleManager } from './SharedBleManager';

export function useBleDevices() {
  const [hasPermission, requestPermissions] = useBluetoothPermissions();

  const [devices, setDevices] = useState<BleDevice[]>([]);
  useAsyncEffect(
    (isMounted) => {
      if (!hasPermission) return;

      const sub = SharedBleManager.instance()
        .observeDevices()
        .subscribe({
          next: (devices) => {
            if (isMounted()) setDevices(devices);
          },
        });

      return () => {
        sub.unsubscribe();
      };
    },
    (destroy) => destroy?.(),
    [hasPermission],
  );

  if (!hasPermission) return err({ type: 'permissions-required', requestPermissions } as const);

  return ok(devices);
}
