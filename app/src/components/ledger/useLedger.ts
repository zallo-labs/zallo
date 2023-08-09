import { ethers } from 'ethers';
import AppEth from '@ledgerhq/hw-app-eth';
import { Address, Hex, asAddress, asHex } from 'lib';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { EIP712Message } from '@ledgerhq/types-live';
import { ResultAsync, err } from 'neverthrow';
import { DeviceId } from 'react-native-ble-plx';
import useAsyncEffect from 'use-async-effect';
import { useCallback, useState } from 'react';
import { LockedDeviceError, StatusCodes, DisconnectedDevice } from '@ledgerhq/errors';
import { P, match } from 'ts-pattern';
import { clog } from '~/util/format';
import { bufferTime, filter } from 'rxjs';
import { persistedAtom } from '~/util/persistedAtom';
import { useAtomValue } from 'jotai';
import { FragmentType, gql, useFragment as getFragment } from '@api/generated';
import { getInfosForServiceUuid, DeviceModelId } from '@ledgerhq/devices';
import { BleDevice, SharedBleManager } from './SharedBleManager';
import { logWarning } from '~/util/analytics';
import { toUtf8Bytes } from 'ethers/lib/utils';
import useBluetoothPermissions from './useBluetoothPermissions';
import _ from 'lodash';
import { retryAsync } from '~/util/retry';

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

  const [result, setResult] = useState<ConnectLedgerResult | undefined>(undefined);
  const approverBleIds = useAtomValue(APPROVER_BLE_IDS);

  const approver = typeof device !== 'string' ? getFragment(UserApprover, device) : undefined;

  const tryConnect = useCallback(
    async (isMounted: () => boolean) => {
      if (!hasPermission || !isMounted()) return;

      const abortController = new AbortController();
      const deviceIds = approver
        ? [...(approverBleIds[approver.address] ?? []), ...(approver?.bluetoothDevices ?? [])]
        : [device as string];

      const newResult = await connectLedger(deviceIds, setResult, abortController.signal);

      let retryTimeout: NodeJS.Timeout | undefined;
      let nextAttempt: ReturnType<typeof tryConnect> | undefined = undefined;

      if (isMounted()) {
        setResult(newResult);
        if (!newResult.isOk())
          retryTimeout = setTimeout(() => {
            nextAttempt = tryConnect(isMounted);
          }, 250);
      }

      return () => {
        abortController.abort();
        clearTimeout(retryTimeout);
        nextAttempt?.then((unmount) => unmount?.());
      };
    },
    [hasPermission, approver, approverBleIds, device],
  );

  useAsyncEffect(
    (isMounted) => tryConnect(isMounted),
    (destroy) => destroy?.(),
    [tryConnect],
  );

  useAsyncEffect(
    (isMounted) => {
      if (!result?.isOk()) return;

      const onDisconnect = () => isMounted() && setResult(undefined);
      result.value.eth.transport.on('disconnect', onDisconnect);

      return () => {
        result.value.eth.transport.off('disconnect', onDisconnect);
        result.value.eth.transport.close();
      };
    },
    (destroy) => destroy?.(),
    [result],
  );

  return hasPermission
    ? result || err('connection-failed')
    : err({ type: 'permissions-required' as const, requestPermissions });
}

// Based off https://github.com/ethers-io/ethers.js/blob/v5.7/packages/hardware-wallets/src.ts/ledger.ts
// Unfortunately the ethers version only supports HID devices and has been removed in ethers 6

const PATH = "44'/60'/0'/0/0"; // HD path for Ethereum account
const WRONG_APP_STATUS = 0x6511; // https://support.ledger.com/hc/en-us/articles/11190934937117-Solve-error-0x6511

const isTransportStatusError = (e: unknown): e is Error & { statusCode: number } =>
  e instanceof Error &&
  e.name === 'TransportStatusError' &&
  'statusCode' in e &&
  typeof e['statusCode'] === 'number';

type ConnectLedgerResult = Awaited<ReturnType<typeof connectLedger>>;

function connectLedger(
  deviceIds: DeviceId[],
  updateResult: (v: ConnectLedgerResult | undefined) => void,
  signal?: AbortSignal,
) {
  return ResultAsync.fromPromise(
    new Promise<BleDevice>((resolve, reject) => {
      signal?.addEventListener('abort', reject);

      console.log('find');
      // updateResult(err('not-found' as const));
      const observable = SharedBleManager.instance()
        .listen()
        .pipe(filter((d) => deviceIds.includes(d.id)));

      if (deviceIds.length === 1) {
        // Simply find the device if there is only one
        observable.subscribe({
          next: (d) => {
            resolve(d);
          },
          error: reject,
        });
      } else {
        // Find the closest device; batch advertisements in 100ms windows
        // The Ledger Nano S advertises every ~50ms
        observable.pipe(bufferTime(100)).subscribe({
          next: (devices) => {
            if (devices.length > 0) {
              const bestMatch = devices.sort((a, b) => (a.rssi ?? 0) - (b.rssi ?? 0))[0];
              resolve(bestMatch);
            }
          },
          error: reject,
        });
      }
    }),
    (e) => {
      clog({ findError: e });
      return 'not-found' as const;
    },
  )
    .andThen((device) => {
      console.log('TransportBLE.open');
      // updateResult(err('connection-failed' as const));

      return ResultAsync.fromPromise(TransportBLE.open(device), (e) => {
        clog({ transportOpenError: e, type: typeof e, name: (e as Error).name });
        return 'connection-failed' as const;
      });
    })
    .andThen((transport) => {
      updateResult(err('eth-app-closed' as const));

      return ResultAsync.fromPromise(
        retryAsync(
          async () => {
            const eth = new AppEth(transport);
            const address = asAddress((await eth.getAddress(PATH)).address);

            return { eth, address, transport };
          },
          {
            maxAttempts: Infinity,
            delayMs: 250,
            retryIf: (e) => {
              const m = match(e)
                .with(P.instanceOf(LockedDeviceError), () => 'locked' as const)
                .with(
                  P.intersection(P.when(isTransportStatusError), { statusCode: WRONG_APP_STATUS }),
                  () => 'eth-app-closed' as const,
                )
                .otherwise(() => null);

              if (m) updateResult(err(m));

              return !!m;
            },
            signal,
          },
        ),
        (e) =>
          match(e)
            .with(P.instanceOf(LockedDeviceError), () => 'locked' as const) // Never happens, always retries
            .otherwise(() => 'eth-app-closed' as const),
      );
    })
    .map(({ eth, address, transport }) => {
      const asResult = <R>(promise: Promise<R>, acceptableStatusCodes?: number[]) =>
        ResultAsync.fromPromise(promise, (error) => {
          const e = error as Error;

          if (isTransportStatusError(e) && acceptableStatusCodes?.includes(e.statusCode)) return e;

          if (
            !(
              (isTransportStatusError(e) && [StatusCodes.INCORRECT_DATA].includes(e.statusCode)) ||
              e instanceof DisconnectedDevice
            )
          )
            logWarning('Unexpected Ledger error', {
              error,
              deviceModel: transport.deviceModel.id,
            });

          transport.close();
          updateResult(undefined);

          return e;
        });

      return {
        eth,
        address,
        transport,
        signMessage(message: string) {
          const messageHex = asHex(toUtf8Bytes(message)).substring(2);

          return asResult(eth.signPersonalMessage(PATH, messageHex), [
            StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED,
          ])
            .mapErr(() => 'user-rejected' as const)
            .map(hexlifySignature);
        },
        signEip712Message(m: EIP712Message) {
          return asResult(
            match(transport.deviceModel.id)
              // The Nano S doesn't support eth.signEIP712Message()
              .with(DeviceModelId.nanoS, () =>
                eth.signEIP712HashedMessage(
                  PATH,
                  asHex(ethers.utils._TypedDataEncoder.hashDomain(m.domain)).substring(2),
                  asHex(
                    ethers.utils._TypedDataEncoder
                      .from(_.omit(m.types, ['EIP712Domain'])) // ethers doesn't allowing including EIP712Domain in types
                      .hash(m.message),
                  ).substring(2),
                ),
              )
              .otherwise(() => eth.signEIP712Message(PATH, m)),
            [StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED],
          )
            .mapErr(() => 'user-rejected' as const)
            .map(hexlifySignature);
        },
      };
    });
}

function hexlifySignature(sig: { v: number; r: string; s: string }): Hex {
  return asHex(
    ethers.utils.joinSignature({
      v: sig.v,
      r: '0x' + sig.r,
      s: '0x' + sig.s,
    }),
  );
}

const MAC_PATTERN = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
export function isMacAddress(v: unknown): v is string {
  return typeof v === 'string' && !!v.match(MAC_PATTERN);
}

export function getLedgerDeviceModel(d: BleDevice) {
  return (d.serviceUUIDs?.length && getInfosForServiceUuid(d.serviceUUIDs[0])?.deviceModel) || null;
}
