import { createTx, hashTx } from './tx';
import * as zk from 'zksync-web3';
import { ZERO_ADDR } from './addr';
import { hexDataLength } from 'ethers/lib/utils';
import { signTx, validateSignature } from './signature';

const wallet = zk.Wallet.createRandom();
const safe = ZERO_ADDR;

const tx = createTx({
  to: wallet.address,
  data: '0x12',
  value: 231,
});

describe('signature', () => {
  it('signing should return a 64B signature', async () => {
    const signature = await signTx(wallet, safe, tx);
    expect(hexDataLength(signature)).toBe(64);
  });

  it('signature should successfully validate', async () => {
    const signature = await signTx(wallet, safe, tx);
    const txHash = await hashTx(safe, tx);
    expect(validateSignature(wallet.address, txHash, signature)).toBeTruthy;
  });
});
