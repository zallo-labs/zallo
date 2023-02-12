import { expect } from 'chai';
import { hashQuorum, ZERO_ADDR } from 'lib';
import {
  AccountImplData,
  gasLimit,
  deployAccountImpl,
  deployFactory,
  deployTesterProxy,
  deployer,
  deployProxy,
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

  describe('ERC1967Proxy', () => {
    it('deploys', async () => {
      const artifact = await deployer.loadArtifact('ERC1967Proxy');
      const contract = await deployer.deploy(artifact, [ZERO_ADDR, []]);
      await contract.deployed();
    });
  });

  describe('Account proxy', () => {
    it('should deploy', async () => {
      const { account } = await deployProxy();
      await account.deployed();
    });

    it('should be initialized with quorums', async () => {
      const { account, quorum } = await deployTesterProxy();
      expect(await account.getQuorumHash(quorum.key)).to.eq(hashQuorum(quorum));
    });
  });
});
