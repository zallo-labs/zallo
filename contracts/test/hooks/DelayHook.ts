import { Address, Hex, randomHex } from 'lib';
import { deploy, network, wallet } from '../util';
import TestVerifier, { abi } from '../contracts/TestVerifier';
import { expect } from 'chai';
import { beforeEach } from 'mocha';

describe('DelayHook', () => {
  let address: Address;
  let proposal: Hex;

  before(async () => {
    address = (await deploy(TestVerifier)).address;
  });

  beforeEach(() => {
    proposal = randomHex(32);
  });

  const schedule = (delay: bigint) =>
    wallet.writeContract({
      address,
      abi,
      functionName: 'beforeExecuteDelay',
      args: [proposal, { delay }],
    });

  const getSchedule = () =>
    network.readContract({
      address,
      abi,
      functionName: 'getSchedule',
      args: [proposal],
    });

  describe('> 0s', () => {
    it('schedule transaction', async () => {
      await schedule(1n);
      expect(await getSchedule()).to.be.gt(0n);
    });

    it('not execute', async () => {
      const r = await network.simulateContract({
        address,
        abi,
        functionName: 'beforeExecuteDelay',
        args: [proposal, { delay: 1n }],
      });
      expect(r.result).to.be.false;
    });
  });

  describe('= 0s', () => {
    it('not schedule transaction', async () => {
      await schedule(0n);
      expect(await getSchedule()).to.eq(0n);
    });

    it('execute immediately', async () => {
      const r = await network.simulateContract({
        address,
        abi,
        functionName: 'beforeExecuteDelay',
        args: [proposal, { delay: 0n }],
      });
      expect(r.result).to.be.true;
    });
  });
});
