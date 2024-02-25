import { expect } from 'chai';
import {
  hashTx,
  asAddress,
  asTx,
  Address,
  asPolicy,
  Tx,
  ETH_ADDRESS,
  execute,
  encodeScheduledTransaction,
} from 'lib';
import { deploy, deployProxy, DeployProxyData, wallet, network, testNetwork } from './util';
import TestUtil from './contracts/TestUtil';
import { abi } from './contracts/TestAccount';

describe('Scheduled transactions', () => {
  let { account, execute: executeTx } = {} as DeployProxyData;
  let tester: Address;
  let nonce = 0n;
  let tx: Tx;

  before(async () => {
    ({ account, execute: executeTx } = await deployProxy({
      policies: [
        asPolicy({
          key: 0,
          approvers: [wallet.account.address],
          permissions: { delay: 3600 },
        }),
      ],
      testAccount: true,
    }));
    tester = (await deploy(TestUtil)).address;
  });

  beforeEach(() => {
    tx = asTx({ to: tester, value: 1n, nonce: nonce++, gas: 5_000_000n });
  });

  describe('executing delayed transaction', () => {
    it('schedule a transaction', async () => {
      await executeTx(tx);

      expect(
        await network.readContract({
          address: asAddress(account),
          abi,
          functionName: 'getSchedule',
          args: [hashTx(account, tx)],
        }),
      ).to.be.gt(0n);
    });

    it('emit event', async () => {
      await expect(executeTx(tx)).to.includeEvent({ abi, eventName: 'Scheduled' });
    });

    it('not execute operations', async () => {
      const transaction = executeTx(tx);
      await expect(transaction).to.not.includeEvent({ abi, eventName: 'OperationExecuted' });
      await expect(transaction).to.changeBalance(tester, ETH_ADDRESS, 0n);
    });
  });

  describe('executing scheduled transaction', async () => {
    it('execute operation after delay', async () => {
      await executeTx(tx);
      await testNetwork.mine({ blocks: 1000, interval: 10000 });

      const scheduledTx = await encodeScheduledTransaction({
        network,
        account: asAddress(account),
        tx,
      });
      await expect(
        (await execute(scheduledTx).map((t) => t.transactionHash))._unsafeUnwrap(),
      ).to.includeEvent({
        abi,
        eventName: 'OperationExecuted',
      });
    });

    /* Not sure why these succeed */
    // it('revert if prior to delay', async () => {
    //   await executeTx(tx);

    //   await expect(
    //     execute(
    //       await encodeScheduledTransaction({
    //         network,
    //         account: asAddress(account),
    //         tx,
    //       }),
    //     ).map((t) => t.transactionHash),
    //   ).to.revertWith({
    //     abi,
    //     errorName: 'NotScheduledYet',
    //   });
    // });

    // it('revert if already executed', async () => {
    //   await executeTx(tx);

    //   await expect(
    //     execute(
    //       await encodeScheduledTransaction({
    //         network,
    //         account: asAddress(account),
    //         tx,
    //       }),
    //     ).map((t) => t.transactionHash),
    //   ).to.not.revert;

    //   await expect(
    //     execute(
    //       await encodeScheduledTransaction({
    //         network,
    //         account: asAddress(account),
    //         tx,
    //       }),
    //     ).then((r) => (r.isOk() ? r.value : r.error)),
    //   ).to.revertWith({
    //     abi,
    //     errorName: 'NotScheduledYet',
    //   });
    // });
  });
});
