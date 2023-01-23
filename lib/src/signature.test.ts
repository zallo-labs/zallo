import { Tx, hashTx, toTx } from './tx';
import * as zk from 'zksync-web3';
import { ZERO_ADDR } from './addr';
import { hexDataLength } from 'ethers/lib/utils';
import { signTx, validateSignature } from './signature';
import { BigNumber } from 'ethers';

const device = zk.Wallet.createRandom();
const account = ZERO_ADDR;

const tx = toTx({
  to: device.address,
  data: '0x12',
  value: BigNumber.from(231),
});

describe('example', () => {
  it('pass', () => {
    //
  });
});

// TODO: mock provider
// describe('signature', () => {
//   it('signing should return a 64B signature', async () => {
//     const signature = await signTx(device, account, tx);
//     expect(hexDataLength(signature)).toBe(64);
//   });

//   it('signature should successfully validate', async () => {
//     const signature = await signTx(device, account, tx);
//     const txHash = await hashTx(
//       { address: account, provider: device.provider, tx },
//     );
//     expect(validateSignature(device.address, txHash, signature)).toBeTruthy;
//   });
// });
