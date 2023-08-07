import { useEffect, useRef, useState } from 'react';
import { LogBox } from 'react-native';
import { Device as BleDescriptor, DeviceId } from 'react-native-ble-plx';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { HwTransportError } from '@ledgerhq/errors';
import { DeviceModel } from '@ledgerhq/devices';
import { Observable } from 'rxjs';
import { logTrace, logWarning } from '~/util/analytics';
import { Err, err, ok } from 'neverthrow';
import useBluetoothPermissions from './useBluetoothPermissions';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const BEACON_TIMEOUT_MS = 2000;

export interface LedgerBleDevice {
  descriptor: BleDescriptor;
  deviceModel: DeviceModel;
}

export function useLedgerBleDevices() {
  const [hasPermission, requestPermissions] = useBluetoothPermissions();

  const [bleAvailable, setBleAvailable] = useState<
    boolean | Err<unknown, { type: 'bluetooth-disabled' }>
  >(false);
  useEffect(() => {
    if (hasPermission) {
      const sub = new Observable(TransportBLE.observeState).subscribe((e) => {
        setBleAvailable(
          e.type === 'PoweredOff' ? err({ type: 'bluetooth-disabled' }) : e.available,
        );
      });

      return () => sub.unsubscribe();
    }
  }, [hasPermission]);

  const [devices, setDevices] = useState<LedgerBleDevice[]>([]);

  useEffect(() => {
    if (!bleAvailable) return;

    const timeouts: Record<DeviceId, NodeJS.Timeout> = {};

    const sub = new Observable(TransportBLE.listen).subscribe({
      next: (device: { type: 'add' } & LedgerBleDevice) => {
        if (device.type !== 'add')
          return logWarning('Unexpected TransportBLE.listen value', { device });

        // Only keep Ledger devices
        if (!device.deviceModel) return;

        setDevices((devices) =>
          devices.find((d) => d.descriptor.id === device.descriptor.id)
            ? devices
            : [...devices, device],
        );

        // Remove device from list if not seen for some time
        clearTimeout(timeouts[device.descriptor.id]);
        timeouts[device.descriptor.id] = setTimeout(
          () =>
            setDevices((devices) =>
              devices.filter((d) => d.descriptor.id !== device.descriptor.id),
            ),
          BEACON_TIMEOUT_MS,
        );
      },
      error: (e: HwTransportError) => logTrace('Ledger BLE listen', { error: e }),
    });

    return () => sub.unsubscribe();
  }, [bleAvailable]);

  if (typeof bleAvailable === 'object') return bleAvailable;
  if (!hasPermission) return err({ type: 'permission-required', requestPermissions } as const);

  return ok(devices);
}
