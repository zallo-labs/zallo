import {
  BleManager as InternalBleManager,
  BleManagerOptions,
  Device as BleDevice,
  State as BleState,
  DeviceId,
  BleError as InternalBleError,
  ScanOptions,
  ConnectionOptions,
  BleErrorCode,
} from 'react-native-ble-plx';
import { Observable, Unsubscribable } from 'rxjs';
import { setBleManagerInstance as setLedgerBleManagerInstance } from '@ledgerhq/react-native-hw-transport-ble';
import { getBluetoothServiceUuids as getLedgerServiceUuids } from '@ledgerhq/devices';
import { P, match } from 'ts-pattern';
import { err, ok } from 'neverthrow';
import { BleDevicesResult, BleError, BleListenResult } from './util';

type ScanListener = (error: InternalBleError | null, scannedDevice: BleDevice | null) => void;

export function bleListen(): BleListenResult {
  return SharedBleManager.instance().listen();
}

export function bleDevices(): BleDevicesResult {
  return SharedBleManager.instance().observeDevices();
}

class SharedBleManager extends InternalBleManager {
  private static _instance: SharedBleManager | null = null;
  private _devices = new Map<DeviceId, BleDevice>();
  private _timeouts = new Map<DeviceId, NodeJS.Timeout>();
  private _scanListeners = new Map<ScanListener, ScanListener>();
  allowlistedServiceUuids = getLedgerServiceUuids();
  beaconTimeoutMs = 3000;

  private constructor(_options?: BleManagerOptions) {
    if (_options) console.trace('SharedBleManager options ignored');
    super();
  }

  static instance() {
    if (!this._instance) {
      this._instance = new SharedBleManager();
      setLedgerBleManagerInstance(this._instance);
    }

    return this._instance;
  }

  listen(): BleListenResult {
    return new Observable((subscriber) => {
      let scanListener: Unsubscribable | undefined;
      const stateSub = this.onStateChange((state) => {
        const error = match(state)
          .returnType<false | BleError>()
          .with(BleState.PoweredOn, () => false)
          .with(
            P.union(BleState.PoweredOff, BleState.Resetting, BleState.Unknown),
            () => 'disabled',
          )
          .with(BleState.Unsupported, () => 'unsupported')
          .with(BleState.Unauthorized, () => 'permissions-required')
          .exhaustive();

        if (error) {
          subscriber.next(err(error));
          return;
        }

        [...this._devices.values()].forEach((device) => subscriber.next(ok(device)));

        scanListener?.unsubscribe();
        scanListener = this.addScanListener((error, device) => {
          // if (error) subscriber.error(error);
          if (error) console.error(error);
          if (device) subscriber.next(ok(device));
        });
      }, true);

      subscriber.add(() => {
        scanListener?.unsubscribe();
        stateSub.remove();
      });
    });
  }

  startDeviceScan(
    _UUIDs: string[] | null,
    _options: ScanOptions | null,
    listener: ScanListener,
  ): void {
    this.addScanListener(listener);
  }

  private addScanListener(listener: ScanListener) {
    if (this._scanListeners.size === 0) {
      super.startDeviceScan(
        this.allowlistedServiceUuids,
        { allowDuplicates: true },
        (error, device) => {
          this._scanListeners.forEach((listener) => listener(error, device));
        },
      );
    }

    this._scanListeners.set(listener, listener);

    return {
      unsubscribe: () => {
        this._scanListeners.delete(listener);
        this.stopDeviceScan();
      },
    };
  }

  stopDeviceScan(): void {
    if (this._scanListeners.size === 0) {
      super.stopDeviceScan();
    }
  }

  observeDevices(): BleDevicesResult {
    return new Observable((subscriber) => {
      const listenSub = this.listen().subscribe((result) => {
        if (result.isErr()) return subscriber.next(err(result.error));

        const device = result.value;
        if (!this._devices.has(device.id)) {
          this._devices.set(device.id, device);
          subscriber.next(ok([...this._devices.values()]));
        }

        this.setDeviceTimeout(device.id);
      });

      const timeoutSub = this.subscribeToTimeout(() =>
        subscriber.next(ok([...this._devices.values()])),
      );

      subscriber.add(() => {
        listenSub.unsubscribe();
        timeoutSub.unsubscribe();
      });
    });
  }

  private _onTimeoutListeners = new Map<() => void, () => void>();

  private subscribeToTimeout(listener: () => void) {
    this._onTimeoutListeners.set(listener, listener);

    return { unsubscribe: () => this._onTimeoutListeners.delete(listener) };
  }

  private setDeviceTimeout(deviceId: DeviceId) {
    clearTimeout(this._timeouts.get(deviceId));
    this._timeouts.set(
      deviceId,
      setTimeout(() => {
        this._devices.delete(deviceId);
        this._onTimeoutListeners.forEach((f) => f());
      }, this.beaconTimeoutMs),
    );
  }

  async connectToDevice(
    deviceIdentifier: string,
    options?: ConnectionOptions | undefined,
  ): Promise<BleDevice> {
    const d = await super.connectToDevice(deviceIdentifier, options);

    if (await d.isConnected()) {
      clearTimeout(this._timeouts.get(d.id));

      let sub: { remove: () => void } | undefined = undefined;
      sub = d.onDisconnected(() => {
        sub?.remove();
        this.setDeviceTimeout(deviceIdentifier);
      });
    }

    return d;
  }
}
