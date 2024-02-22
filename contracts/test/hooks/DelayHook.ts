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

  const schedule = (delay: number) =>
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
      await schedule(1);
      expect(await getSchedule()).to.be.gt(0);
    });

    it('not execute', async () => {
      const r = await network.simulateContract({
        address,
        abi,
        functionName: 'beforeExecuteDelay',
        args: [proposal, { delay: 1 }],
      });
      expect(r.result).to.be.false;
    });
  });

  describe('= 0s', () => {
    it('not schedule transaction', async () => {
      await schedule(0);
      expect(await getSchedule()).to.eq(0);
    });

    it('execute immediately', async () => {
      const r = await network.simulateContract({
        address,
        abi,
        functionName: 'beforeExecuteDelay',
        args: [proposal, { delay: 0 }],
      });
      expect(r.result).to.be.true;
    });
  });
});
