import { expect } from 'chai';
import { parseEther } from 'viem';

import { asAddress, asTx, estimateTransactionOperationsGas } from 'lib';
import { deployProxy, network, wallet } from './util';

it('gas estimation', async () => {
  const value = parseEther('0.001');
  const { account } = await deployProxy({ extraBalance: value });

  const tx = asTx({
    to: wallet.account.address,
    value,
    nonce: 0n,
  });

  const gas = await estimateTransactionOperationsGas({ network, account: asAddress(account), tx });
  expect(gas.isOk()).to.be.true;
  expect(gas._unsafeUnwrap()).greaterThan(0n);
});
