import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { AccountError, hashQuorum, toQuorumKey, zeroHexBytes } from 'lib';
import { DeployTesterProxyData, deployTesterProxy, ACCOUNT_START_BALANCE } from './util';

describe('Quorum', () => {
  let { account, quorum, execute } = {} as DeployTesterProxyData;
  before(
    async () =>
      ({ account, quorum, execute } = await deployTesterProxy({
        extraBalance: ACCOUNT_START_BALANCE.mul(5),
      })),
  );

  describe('Hashing', () => {
    it('should match', async () => {
      expect(await account.getQuorumHash(quorum.key)).to.eq(hashQuorum(quorum));
    });
  });

  const getUpsert = () => {
    const key = toQuorumKey(quorum.key + 1);
    const hash = hashQuorum({ ...quorum, key });

    return {
      key,
      hash,
      upsert: execute({
        to: account.address,
        data: account.interface.encodeFunctionData('upsertQuorum', [key, hash]),
        gasLimit: BigNumber.from(1_000_000),
      }),
    };
  };

  describe('Upserting', () => {
    it("should set the quorum's hash", async () => {
      const { key, hash, upsert } = getUpsert();

      await (await upsert).wait();
      expect(await account.getQuorumHash(key)).to.eq(hash);
    });

    it('should emit an event', async () => {
      const { key, hash, upsert } = getUpsert();

      await expect(upsert)
        .to.emit(account, account.interface.events['QuorumUpserted(uint32,bytes32)'].name)
        .withArgs(key, hash);
    });

    it('should only be callable by the account', async () => {
      await expect(account.upsertQuorum(quorum.key, hashQuorum(quorum), { gasLimit: 1_000_000 })).to
        .be.reverted; // TODO: re-enable once fixed - revertedWithCustomError(account, AccountError.OnlyCallableBySelf);
    });
  });

  describe('Removing', () => {
    it("should zero the quorum's hash", async () => {
      const { key, upsert } = getUpsert();

      await (await upsert).wait();
      await (
        await execute({
          to: account.address,
          data: account.interface.encodeFunctionData('removeQuorum', [key]),
          gasLimit: BigNumber.from(1_000_000),
        })
      ).wait();

      expect(await account.getQuorumHash(key)).to.eq(zeroHexBytes(32));
    });

    it('should emit an event', async () => {
      const { key, upsert } = getUpsert();

      await (await upsert).wait();

      await expect(
        execute({
          to: account.address,
          data: account.interface.encodeFunctionData('removeQuorum', [key]),
          gasLimit: BigNumber.from(1_000_000),
        }),
      )
        .to.emit(account, account.interface.events['QuorumRemoved(uint32)'].name)
        .withArgs(key);
    });

    it('should only be callable by the account', async () => {
      await expect(account.removeQuorum(quorum.key, { gasLimit: 1_000_000 })).to.be.reverted; // TODO: re-enable once fixed - revertedWithCustomError(account, AccountError.OnlyCallableBySelf);
    });
  });
});
