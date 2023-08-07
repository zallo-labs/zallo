import { ethers } from 'ethers';
import AppEth from '@ledgerhq/hw-app-eth';
import { Address, Hex, asAddress, asHex, isAddress } from 'lib';
import { LedgerBleDevice } from './useLedgerBleDevices';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { ResultAsync, err } from 'neverthrow';
import { Device as BleDescriptor, DeviceId } from 'react-native-ble-plx';
import useAsyncEffect from 'use-async-effect';
import { useCallback, useState } from 'react';
import { LockedDeviceError } from '@ledgerhq/errors';
import { P, match } from 'ts-pattern';
import { clog } from '~/util/format';
import { Observable, bufferTime, filter, map } from 'rxjs';
import { HwTransportError } from '@ledgerhq/errors';
import { persistedAtom } from '~/util/persistedAtom';
import { useAtomValue } from 'jotai';
import { useQuery } from '~/gql';
import { gql } from '@api/generated';

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

function connectLedger(deviceIds: DeviceId[]) {
  const eth = ResultAsync.fromPromise(
    new Promise<BleDescriptor>((resolve, reject) => {
      const observable = new Observable<{ type: 'add' } & LedgerBleDevice>(
        TransportBLE.listen,
      ).pipe(
        filter((d) => d.type === 'add' && deviceIds.includes(d.descriptor.id)),
        map((d) => d.descriptor),
      );

      const handleErrors = {
        complete: () => reject(new Error('Connection closed')),
        error: (e: HwTransportError) => reject(e),
      };

      if (deviceIds.length === 1) {
        // Simply find the device if there is only one
        observable.subscribe({
          next: (d) => {
            resolve(d);
          },
          ...handleErrors,
        });
      } else {
        // Find the closest device; batch advertisements in 200ms windows
        // The Ledger Nano S advertises every ~50ms
        observable.pipe(bufferTime(200)).subscribe({
          next: (devices) => {
            if (devices.length > 0) {
              const bestMatch = devices.sort((a, b) => (a.rssi ?? 0) - (b.rssi ?? 0))[0];
              resolve(bestMatch);
            }
          },
          ...handleErrors,
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
          transport.close(); // necessary?

          return match(e)
            .with(P.instanceOf(LockedDeviceError), () => 'locked' as const)
            .otherwise(() => 'eth-app-closed' as const);
        },
      ),
    );

  return eth.map(({ eth, address, transport }) => ({
    eth,
    address,
    transport,
    async signMessage(message: string | ethers.utils.Bytes): Promise<Hex> {
      if (typeof message === 'string') message = ethers.utils.toUtf8Bytes(message);

      const messageHex = ethers.utils.hexlify(message).substring(2);

      return hexlifySignature(await eth.signPersonalMessage(PATH, messageHex));
    },
  }));
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
