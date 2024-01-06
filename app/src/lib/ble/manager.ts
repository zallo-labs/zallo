import { err } from 'neverthrow';
import { Observable } from 'rxjs';

import { BleDevicesResult, BleListenResult } from './util';

export function bleListen(): BleListenResult {
  return new Observable((subject) => {
    subject.next(err('unsupported'));
  });
}

export function bleDevices(): BleDevicesResult {
  return new Observable((subject) => {
    subject.next(err('unsupported'));
  });
}
