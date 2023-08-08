import {
  BleManager,
  BleManagerOptions,
  Device as BleDevice,
  State as BleState,
  DeviceId,
  BleError,
  ScanOptions,
  ConnectionOptions,
} from 'react-native-ble-plx';
import { Observable, Unsubscribable } from 'rxjs';
import { DeviceModel as LedgerModel } from '@ledgerhq/devices';
import { setBleManagerInstance as setLedgerBleManagerInstance } from '@ledgerhq/react-native-hw-transport-ble';
import { LogBox } from 'react-native';
import { getBluetoothServiceUuids as getLedgerServiceUuids } from '@ledgerhq/devices';

LogBox.ignoreLogs(['new NativeEventEmitter()']); // Required due to misuse inside ledger dependency

export type { BleDevice, LedgerModel };

type ScanListener = (error: BleError | null, scannedDevice: BleDevice | null) => void;

const ALLOWLISTED_SERVICE_UUIDS = getLedgerServiceUuids();

const BEACON_TIMEOUT_MS = 3000;

export class SharedBleManager extends BleManager {
  private static _instance: SharedBleManager | null = null;
  private _devices = new Map<DeviceId, BleDevice>();
  private _timeouts = new Map<DeviceId, NodeJS.Timeout>();
  private _scanListeners = new Map<ScanListener, ScanListener>();

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

  listen(): Observable<BleDevice> {
    return new Observable((subscriber) => {
      let scanListener: Unsubscribable | undefined;
      const stateSub = this.onStateChange((state) => {
        if (state !== BleState.PoweredOn) return;

        [...this._devices.values()].forEach((device) => subscriber.next(device));

        scanListener?.unsubscribe();
        scanListener = this.addScanListener((error, device) => {
          if (error) subscriber.error?.(error);
          if (device) subscriber.next(device);
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
      console.log('Starting device scan');
      super.startDeviceScan(ALLOWLISTED_SERVICE_UUIDS, null, (error, device) => {
        this._scanListeners.forEach((listener) => listener?.(error, device));
      });
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
      console.log('Stopping device scan');
      super.stopDeviceScan();
    }
  }

  observeDevices(): Observable<BleDevice[]> {
    return new Observable((subscriber) => {
      const listenSub = this.listen().subscribe({
        next: (device) => {
          if (!this._devices.has(device.id)) {
            this._devices.set(device.id, device);
            subscriber.next([...this._devices.values()]);
          }

          this.setDeviceTimeout(device.id);
        },
        error: subscriber.error,
      });

      const timeoutSub = this.subscribeToTimeout(() =>
        subscriber.next([...this._devices.values()]),
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
      }, BEACON_TIMEOUT_MS),
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
