import { parseEther } from 'viem';
import { PROVIDER, WALLET, deployProxy } from './util';
import { asTx, estimateTransactionOperationsGas } from 'lib';
import { expect } from 'chai';

it('gas estimation', async () => {
  const value = parseEther('0.001');
  const { account } = await deployProxy({ extraBalance: value });

  const tx = asTx({
    to: WALLET.address,
    value,
    nonce: 0n,
  });

  const gas = await estimateTransactionOperationsGas(PROVIDER, account.address, tx);
  expect(gas.isOk()).to.be.true;
  expect(gas._unsafeUnwrap()).greaterThan(0n);
});
