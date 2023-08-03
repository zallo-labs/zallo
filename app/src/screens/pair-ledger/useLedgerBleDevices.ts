import { useEffect, useState } from 'react';
import { Device as BleDescriptor } from 'react-native-ble-plx';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { HwTransportError } from '@ledgerhq/errors';
import { DeviceModel } from '@ledgerhq/devices';
import { Observable } from 'rxjs';
import { logTrace, logWarning } from '~/util/analytics';
import { Err, err, ok } from 'neverthrow';
import useBluetoothPermissions from './useBluetoothPermissions';

export interface LedgerBleDevice {
  descriptor: BleDescriptor;
  deviceModel: DeviceModel;
}

export interface UseBleDevicesOptions {
  onAdd?: (device: LedgerBleDevice, devices: LedgerBleDevice[]) => void;
}

export function useLedgerBleDevices({ onAdd }: UseBleDevicesOptions = {}) {
  const [hasPermission, requestPermissions] = useBluetoothPermissions();

  const [bleAvailable, setBleAvailable] = useState<
    boolean | Err<unknown, { type: 'bluetooth-disabled' }>
  >(false);
  useEffect(() => {
    if (hasPermission) {
      new Observable(TransportBLE.observeState).subscribe((e) => {
        setBleAvailable(
          e.type === 'PoweredOff' ? err({ type: 'bluetooth-disabled' }) : e.available,
        );
      });
    }
  }, [hasPermission]);

  const [devices, setDevices] = useState<LedgerBleDevice[]>([]);

  useEffect(() => {
    if (!bleAvailable) return;

    const sub = new Observable(TransportBLE.listen).subscribe({
      complete: () => console.log('Complete'),
      next: (device: { type: 'add' } & LedgerBleDevice) => {
        if (device.type !== 'add')
          return logWarning('Unexpected TransportBLE.listen value', { device });

        // Only keep Ledger devices
        if (!device.deviceModel) return;

        setDevices((devices) => {
          onAdd?.(device, devices);

          return devices.find((d) => d.descriptor.id === device.descriptor.id)
            ? devices
            : [...devices, device];
        });
      },
      error: (e: HwTransportError) => {
        logTrace('Ledger BLE listen', { error: e });
      },
    });

    return () => sub.unsubscribe();
  }, [bleAvailable, onAdd]);

  if (typeof bleAvailable === 'object') return bleAvailable;
  if (!hasPermission) return err({ type: 'permission-required', requestPermissions } as const);

  return ok(devices);
}
