import type { DeviceModel as LedgerModel } from '@ledgerhq/devices';
import type { Device as BleDevice } from 'react-native-ble-plx';
import { Result } from 'neverthrow';
import { Observable } from 'rxjs';

export type { BleDevice, LedgerModel };

export type BleError = 'disabled' | 'unsupported' | 'permissions-required';

export type BleListenResult = Observable<Result<BleDevice, BleError>>;

export type BleDevicesResult = Observable<Result<BleDevice[], BleError>>;

const MAC_PATTERN = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
export function isUniqueBleDeviceId(v: string) {
  return !!v.match(MAC_PATTERN);
}
