import { expect } from 'chai';
import {
  AccountImplData,
  gasLimit,
  deployAccountImpl,
  deployFactory,
  deployProxy,
  deploy,
} from './util';

describe('Deployment', () => {
  describe('Account', () => {
    let { account } = {} as AccountImplData;

    before(async () => {
      ({ account } = await deployAccountImpl());
    });

    it('should deploy', async () => {
      await account.deployed();
    });

    it('should revert if initialization is attempted', async () => {
      await expect(account.initialize([], { gasLimit: gasLimit })).to.be.reverted;
    });
  });

  describe('Proxy factory', () => {
    it('should deploy', async () => {
      await deployFactory('ERC1967Proxy');
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
      await account.deployed();
    });
  });
});
