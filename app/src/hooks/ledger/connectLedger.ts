import { ethers } from 'ethers';
import AppEth from '@ledgerhq/hw-app-eth';
import { Address, Hex, asAddress, asHex } from 'lib';
import TransportBLE from '~/lib/ble/ledger';
import { EIP712Message } from '@ledgerhq/types-live';
import { Ok, Result, ResultAsync, err } from 'neverthrow';
import { DeviceId } from 'react-native-ble-plx';
import { LockedDeviceError, StatusCodes, DisconnectedDevice } from '@ledgerhq/errors';
import { P, match } from 'ts-pattern';
import { Observable, bufferTime, filter } from 'rxjs';
import { getInfosForServiceUuid, DeviceModelId } from '@ledgerhq/devices';
import { logWarning } from '~/util/analytics';
import _ from 'lodash';
import { retryAsync } from '~/util/retry';
import { TypedDataDefinition, stringToHex } from 'viem';
import { WritableDeep } from 'ts-toolbelt/out/Object/Writable';
import { bleListen } from '~/lib/ble/manager';
import { BleDevice } from '~/lib/ble/util';

// Based off https://github.com/ethers-io/ethers.js/blob/v5.7/packages/hardware-wallets/src.ts/ledger.ts
// Unfortunately the ethers version only supports HID devices and has been removed in ethers 6

const PATH = "44'/60'/0'/0/0"; // HD path for Ethereum account
const WRONG_APP_STATUS = 0x6511; // https://support.ledger.com/hc/en-us/articles/11190934937117-Solve-error-0x6511

type ConnectState = 'finding' | 'connecting' | 'locked' | 'waiting-for-app';

export interface LedgerApprover {
  eth: AppEth;
  transport: TransportBLE;
  address: Address;
  signMessage(message: string): ResultAsync<Hex, 'user-rejected'>;
  signEip712Message(m: TypedDataDefinition): ResultAsync<Hex, 'user-rejected'>;
}

export type LedgerConnectEvent = Result<LedgerApprover, ConnectState>;

export function connectLedger(deviceIds: DeviceId[]) {
  return new Observable<LedgerConnectEvent>((sub) => {
    const abortController = new AbortController(); // Controls observable & any open connection

    // Main loop - runs until observer unsubscribes (aborting)
    (async () => {
      while (!abortController.signal.aborted) {
        const connectionController = new AbortController(); // Controls connection
        abortController.signal.addEventListener('abort', () => connectionController.abort());

        const result = await connect(
          () => connectionController.abort(),
          connectionController.signal,
        );

        sub.next(result);

        if (result.isOk()) {
          // Wait for connection to be aborted
          await new Promise<void>((resolve) => {
            connectionController.signal.addEventListener('abort', () => resolve());
          });
        }
        // else retry
      }
    })();

    function connect(
      reconnect: () => void,
      signal: AbortSignal,
    ): ResultAsync<LedgerApprover, ConnectState> {
      return ResultAsync.fromPromise(
        new Promise<BleDevice>((resolve, reject) => {
          sub.next(err('finding' as const));
          signal.addEventListener('abort', reject);

          const observable = bleListen().pipe(
            filter((r) => r.isErr() || deviceIds.includes(r.value.id)),
          );

          if (deviceIds.length === 1) {
            // Simply find the device if there is only one
            observable.subscribe((result) => {
              if (result.isOk()) {
                resolve(result.value);
              } else {
                reject(result.error);
              }
            });
          } else {
            // Find the closest device; batch advertisements in 100ms windows
            // The Ledger Nano S advertises every ~50ms
            observable.pipe(bufferTime(100)).subscribe((r) => {
              if (r.length > 0) {
                const bestMatch = r
                  .filter((r): r is Ok<BleDevice, never> => r.isOk())
                  .sort((a, b) => (a.value.rssi ?? 0) - (b.value.rssi ?? 0))?.[0]?.value;

                if (bestMatch) {
                  resolve(bestMatch);
                } else {
                  const err = r.findLast((r) => r.isErr());
                  if (err?.isErr()) reject(err.error);
                }
              }
            });
          }
        }),
        (e) => {
          console.debug({ findError: e });
          return 'finding' as const;
        },
      )
        .andThen((device) => {
          sub.next(err('connecting' as const));

          return ResultAsync.fromPromise(TransportBLE.open(device), (e) => {
            console.debug({ transportOpenError: e });
            return 'connecting' as const;
          });
        })
        .andThen((transport) => {
          sub.next(err('waiting-for-app'));

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
                      P.intersection(P.when(isTransportStatusError), {
                        statusCode: WRONG_APP_STATUS,
                      }),
                      () => 'waiting-for-app' as const,
                    )
                    .otherwise(() => null);

                  if (m) sub.next(err(m));

                  return !!m;
                },
                signal,
              },
            ),
            (e) =>
              match(e)
                .with(P.instanceOf(LockedDeviceError), () => 'locked' as const) // Never happens, always retries
                .otherwise((e) => {
                  console.debug({ appEthErrorOpen: e });
                  return 'waiting-for-app' as const;
                }),
          );
        })
        .map(({ eth, address, transport }) => {
          const asResult = <R>(promise: Promise<R>, acceptableStatusCodes?: number[]) =>
            ResultAsync.fromPromise(promise, async (error) => {
              const e = error as Error;

              if (isTransportStatusError(e) && acceptableStatusCodes?.includes(e.statusCode))
                return e;

              if (
                !(
                  (isTransportStatusError(e) &&
                    [StatusCodes.INCORRECT_DATA].includes(e.statusCode)) ||
                  e instanceof DisconnectedDevice
                )
              )
                logWarning('Unexpected Ledger error', {
                  error,
                  deviceModel: transport.deviceModel.id,
                });

              transport.close();
              reconnect();

              return e;
            });

          return {
            eth,
            address,
            transport,
            signMessage(message: string) {
              const messageHex = stringToHex(message).substring(2);

              return asResult(eth.signPersonalMessage(PATH, messageHex), [
                StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED,
              ])
                .mapErr(() => 'user-rejected' as const)
                .map(hexlifySignature);
            },
            signEip712Message(m: WritableDeep<TypedDataDefinition>) {
              return asResult(
                match(transport.deviceModel.id)
                  // The Nano S doesn't support eth.signEIP712Message()
                  .with(DeviceModelId.nanoS, () =>
                    eth.signEIP712HashedMessage(
                      PATH,
                      asHex(ethers.TypedDataEncoder.hashDomain(m.domain ?? {})).substring(2),
                      // Note. hashStruct not exported from viem, so ethers remains...
                      asHex(
                        ethers.TypedDataEncoder.from(
                          _.omit(m.types as WritableDeep<typeof m.types>, ['EIP712Domain']),
                        ) // ethers doesn't allowing including EIP712Domain in types
                          .hash(m.message),
                      ).substring(2),
                    ),
                  )
                  .otherwise(() => eth.signEIP712Message(PATH, m as unknown as EIP712Message)),
                [StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED],
              )
                .mapErr(() => 'user-rejected' as const)
                .map(hexlifySignature);
            },
          };
        });
    }

    return () => {
      abortController.abort();
    };
  });
}

function hexlifySignature(sig: { v: number; r: string; s: string }): Hex {
  return asHex(
    ethers.Signature.from({
      v: sig.v,
      r: '0x' + sig.r,
      s: '0x' + sig.s,
    }).serialized,
  );
}

export function getLedgerDeviceModel(d: BleDevice) {
  return (d.serviceUUIDs?.length && getInfosForServiceUuid(d.serviceUUIDs[0])?.deviceModel) || null;
}

function isTransportStatusError(e: unknown): e is Error & { statusCode: number } {
  return (
    e instanceof Error &&
    e.name === 'TransportStatusError' &&
    'statusCode' in e &&
    typeof e['statusCode'] === 'number'
  );
}
