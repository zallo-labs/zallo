import { expect } from 'chai';

import { ACCOUNT_ABI, asAddress } from 'lib';
import Account from './contracts/Account';
import AccountProxy from './contracts/AccountProxy';
import { deploy, deployFactory, deployProxy, gas, network, wallet } from './util';

describe('Deployment', () => {
  describe('Account', () => {
    it('should deploy', async () => {
      const { address, deployTx } = await deploy(Account, []);
      await deployTx?.wait();
      expect((await network.getBytecode({ address }))?.length ?? 0).to.be.gt(0);
    });

    it('should revert if initialization is attempted', async () => {
      const { address: account } = await deploy(Account, []);

      await expect(
        wallet.writeContract({
          address: account,
          abi: ACCOUNT_ABI,
          functionName: 'initialize',
          args: [[]],
          gas,
        }),
      ).to.revert;
    });
  });

  describe('Proxy factory', () => {
    it('should deploy', async () => {
      const { address } = await deployFactory(AccountProxy);
      expect((await network.getBytecode({ address }))?.length ?? 0).to.be.gt(0);
    });
  });

  describe('Account proxy', () => {
    it('should deploy', async () => {
      const { account } = await deployProxy();
      expect((await network.getBytecode({ address: asAddress(account) }))?.length ?? 0).to.be.gt(0);
    });
  });
});
