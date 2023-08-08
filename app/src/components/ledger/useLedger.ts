import { ethers } from 'ethers';
import AppEth from '@ledgerhq/hw-app-eth';
import { Address, Hex, asAddress, asHex, isAddress } from 'lib';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { EIP712Message } from '@ledgerhq/types-live';
import { ResultAsync, err } from 'neverthrow';
import { DeviceId } from 'react-native-ble-plx';
import useAsyncEffect from 'use-async-effect';
import { useCallback, useState } from 'react';
import { LockedDeviceError, StatusCodes } from '@ledgerhq/errors';
import { P, match } from 'ts-pattern';
import { clog } from '~/util/format';
import { bufferTime, filter } from 'rxjs';
import { persistedAtom } from '~/util/persistedAtom';
import { useAtomValue } from 'jotai';
import { useQuery } from '~/gql';
import { gql } from '@api/generated';
import { getInfosForServiceUuid, DeviceModelId } from '@ledgerhq/devices';
import { BleDevice, SharedBleManager } from './SharedBleManager';
import { logWarning } from '~/util/analytics';
import { toUtf8Bytes } from 'ethers/lib/utils';

const Query = gql(/* GraphQL */ `
  query UseLedger($approver: Address!) {
    approver(input: { address: $approver }) {
      id
      bluetoothDevices
    }
  }
`);

export const APPROVER_BLUETOOTH_IDS = persistedAtom<Record<Address, DeviceId[]>>(
  'approverBluetoothIds',
  {},
  { skipInitialPersist: true },
);

export function useLedger(device: DeviceId | Address) {
  const [result, setResult] = useState<ConnectLedgerResult | undefined>(undefined);
  const approverBluetoothIds = useAtomValue(APPROVER_BLUETOOTH_IDS);

  const approver = useQuery(Query, { approver: device as Address }, { pause: !isAddress(device) })
    .data?.approver;

  const tryConnect = useCallback(
    async (isMounted: () => boolean) => {
      const newResult = await connectLedger(
        isAddress(device)
          ? [...(approverBluetoothIds[device] ?? []), ...(approver?.bluetoothDevices ?? [])]
          : [device],
        () => setResult(undefined),
      );

      if (!isMounted()) return;

      setResult(newResult);

      if (newResult.isOk()) {
        const onDisconnect = () => {
          if (isMounted()) setResult(undefined);
        };

        newResult.value.eth.transport.on('disconnect', onDisconnect);

        return () => {
          newResult.value.eth.transport.off('disconnect', onDisconnect);
          newResult.value.eth.transport.close();
        };
      } else {
        // Retry
        const timer = setTimeout(() => tryConnect(isMounted), 500);

        return () => clearTimeout(timer);
      }
    },
    [approver?.bluetoothDevices, device, approverBluetoothIds],
  );

  useAsyncEffect((isMounted) => tryConnect(isMounted), [tryConnect]);

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
    [result],
  );

  // TODO: remove on disconnect

  return result || err('connection-failed');
}

// Based off https://github.com/ethers-io/ethers.js/blob/v5.7/packages/hardware-wallets/src.ts/ledger.ts
// Unfortunately the ethers version only supports HID devices and has been removed in ethers 6

const PATH = "44'/60'/0'/0/0"; // HD path for Ethereum account

type ConnectLedgerResult = Awaited<ReturnType<typeof connectLedger>>;

function connectLedger(deviceIds: DeviceId[], reconnect: () => void) {
  const eth = ResultAsync.fromPromise(
    new Promise<BleDevice>((resolve, reject) => {
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
      clog({ find: e });
      return 'find-failed' as const;
    },
  )
    .andThen((device) =>
      ResultAsync.fromPromise(TransportBLE.open(device), (e) => {
        clog({ connection: e });
        return 'connection-failed' as const;
      }),
    )
    .andThen((transport) =>
      ResultAsync.fromPromise(
        (async () => {
          const eth = new AppEth(transport);

          const address = asAddress((await eth.getAddress(PATH, false, false)).address);

          return { eth, address, transport };
        })(),
        (e) => {
          transport.close();

          return match(e)
            .with(P.instanceOf(LockedDeviceError), () => 'locked' as const)
            .otherwise(() => 'eth-app-closed' as const);
        },
      ),
    );

  return eth.map(({ eth, address, transport }) => {
    const asResult = <R>(promise: Promise<R>, acceptableStatusCodes?: number[]) =>
      ResultAsync.fromPromise(promise, (error) => {
        const e = error as Error & { statusCode?: number };

        if (typeof e.statusCode !== 'number' || !acceptableStatusCodes?.includes(e.statusCode)) {
          if (!['DisconnectedDevice'].includes(e.name))
            logWarning('Unexpected Ledger error', { error, deviceModel: transport.deviceModel.id });

          transport.close();
          reconnect();
        }

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
                  ethers.utils._TypedDataEncoder.from(m.types).hash(m.message),
                  /* Potentially _TypedDataEncoder.encode() instead? */
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
