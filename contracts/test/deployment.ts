import { expect } from 'chai';
import { hashQuorum } from 'lib';
import {
  AccountImplData,
  gasLimit,
  deployAccountImpl,
  deployFactory,
  deployTesterProxy,
  DeployTesterProxyData,
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

  describe('Account proxy', () => {
    let { account, quorum } = {} as DeployTesterProxyData;

    before(async () => {
      ({ account, quorum } = await deployTesterProxy());
    });

    it('should deploy', async () => {
      await account.deployed();
    });

    it('should be initialized with quorums', async () => {
      expect(await account.getQuorumHash(quorum.key)).to.eq(hashQuorum(quorum));
    });
  });
});
