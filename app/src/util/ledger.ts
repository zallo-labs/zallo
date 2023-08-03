import { ethers } from 'ethers';
import AppEth from '@ledgerhq/hw-app-eth';
import { Hex, asAddress, asHex } from 'lib';
import { LedgerBleDevice } from '~/screens/pair-ledger/useLedgerBleDevices';
import BleTransport from '@ledgerhq/react-native-hw-transport-ble';
import { ResultAsync } from 'neverthrow';

// Based off https://github.com/ethers-io/ethers.js/blob/v5.7/packages/hardware-wallets/src.ts/ledger.ts
// Unfortunately the ethers version only supports HID devices and has been removed in ethers 6

const PATH = "44'/60'/0'/0/0"; // HD path for Ethereum account

export function connectLedger(device: LedgerBleDevice) {
  const eth = ResultAsync.fromPromise(
    BleTransport.open(device.descriptor),
    (e) =>
      new Error('Failed to connect to Ledger: device must be unlocked with bluetooth enabled', {
        cause: e,
      }),
  ).andThen((transport) =>
    ResultAsync.fromPromise(
      (async () => {
        const eth = new AppEth(transport);
        const address = asAddress((await eth.getAddress(PATH, false, false)).address);

        return { eth, address };
      })(),
      (e) => new Error('Failed to connect to Ledger: Ethereum app must be open', { cause: e }),
    ),
  );

  return eth.map(({ eth, address }) => ({
    device,
    eth,
    address,
    async signMessage(message: string | ethers.utils.Bytes): Promise<Hex> {
      if (typeof message === 'string') message = ethers.utils.toUtf8Bytes(message);

      const messageHex = ethers.utils.hexlify(message).substring(2);

      const sig = await eth.signPersonalMessage(PATH, messageHex);

      return asHex(
        ethers.utils.joinSignature({
          v: sig.v,
          r: '0x' + sig.r,
          s: '0x' + sig.s,
        }),
      );
    },
  }));
}
