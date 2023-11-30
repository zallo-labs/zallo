import { expect } from 'chai';
import { deployFactory, deployProxy, deploy, wallet, gas, network } from './util';
import { ACCOUNT_ABI, asAddress } from 'lib';

describe('Deployment', () => {
  describe('Account', () => {
    it('should deploy', async () => {
      const { address, deployTx } = await deploy('Account');
      await deployTx?.wait();
      expect((await network.getBytecode({ address }))?.length ?? 0).to.be.gt(0);
    });

    it('should revert if initialization is attempted', async () => {
      const { address: account } = await deploy('Account');

      await new Promise((resolve) => setTimeout(resolve, 5000));

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
      const { address } = await deployFactory('AccountProxy');
      expect((await network.getBytecode({ address }))?.length ?? 0).to.be.gt(0);
    });
  });

  // describe('ERC1967Proxy', () => {
  //   it('deploys', async () => {
  //     await deploy('ERC1967Proxy', {
  //       // TODO: impl address needs to be a contract
  //       constructorArgs: [ZERO_ADDR, []],
  //     });
  //   });
  // });

  describe('Account proxy', () => {
    it('should deploy', async () => {
      const { account } = await deployProxy();
      expect((await network.getBytecode({ address: asAddress(account) }))?.length ?? 0).to.be.gt(0);
    });
  });
});
