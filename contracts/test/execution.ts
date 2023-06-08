import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { hashTx, TestUtil, asAddress, TestUtil__factory, asHex, asTx } from 'lib';
import { deploy, deployProxy, DeployProxyData, WALLET } from './util';

describe('Execution', () => {
  let { account, execute } = {} as DeployProxyData;
  let tester = {} as TestUtil;
  let nonce = 0n;

  before(async () => {
    ({ account, execute } = await deployProxy({
      extraBalance: parseEther('0.0001'),
    }));
    tester = TestUtil__factory.connect((await deploy('TestUtil')).address, WALLET);
  });

  describe('operation', () => {
    it('should send the specified value', async () => {
      const to = WALLET;
      const value = parseEther('0.00001');

      await expect(
        execute({ to: to.address, value: value.toBigInt(), nonce: nonce++ }),
      ).to.changeEtherBalance(to, value);
    });

    it('should call with the specified data', async () => {
      const data = '0xabc123';
      await expect(
        execute({
          to: asAddress(tester.address),
          data: asHex(tester.interface.encodeFunctionData('echo', [data])),
          nonce: nonce++,
        }),
      )
        .to.emit(tester, tester.interface.events['Echo(bytes)'].name)
        .withArgs(data);
    });

    it('should emit an event with the response', async () => {
      const data = '0xabc123';
      const txReq = asTx({
        to: asAddress(tester.address),
        data: asHex(tester.interface.encodeFunctionData('echo', [data])),
        nonce: nonce++,
      });

      await expect(execute(txReq))
        .to.emit(account, account.interface.events['OperationExecuted(bytes32,bytes)'].name)
        .withArgs(
          await hashTx(txReq, account),
          '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003abc1230000000000000000000000000000000000000000000000000000000000',
        );
    });

    it('should revert if the transaction has already been executed', async () => {
      const tx = asTx({ to: WALLET.address, nonce: nonce++ });
      await (await execute(tx)).wait();

      await expect(execute(tx)).to.be.rejected;
    });

    it('should revert if the transaction reverts without a message', async () => {
      // AA transactions simply fail, ideally we would expect to:
      // - revertedWithCustomError(account, AccountError.ExecutionReverted);
      // - emit(account, account.interface.events['TxReverted(bytes32,bytes)'].name);

      let reverted = false;
      try {
        await (
          await execute({
            to: asAddress(tester.address),
            data: asHex(tester.interface.encodeFunctionData('revertWithoutReason')),
            nonce: nonce++,
          })
        ).wait();
      } catch (e) {
        reverted = true;
      }
      expect(reverted).to.be.eq(true, 'Expected to revert');
    });

    it('should revert with the message if the transaction reverts with a message', async () => {
      let reverted = false;
      try {
        await (
          await execute({
            to: asAddress(tester.address),
            data: asHex(tester.interface.encodeFunctionData('revertWithReason')),
            nonce: nonce++,
          })
        ).wait();
      } catch (e) {
        reverted = true;
      }
      expect(reverted).to.be.eq(true, 'Expected to revert');
    });
  });

  describe('operations', () => {
    it('should send the specified value', async () => {
      const to = WALLET;
      const value = parseEther('0.00001');

      await expect(
        execute({ to: to.address, value: value.toBigInt(), nonce: nonce++ }),
      ).to.changeEtherBalance(to, value);
    });

    it('should call with the specified data', async () => {
      const data = '0xabc123';
      await expect(
        execute({
          to: asAddress(tester.address),
          data: asHex(tester.interface.encodeFunctionData('echo', [data])),
          nonce: nonce++,
        }),
      )
        .to.emit(tester, tester.interface.events['Echo(bytes)'].name)
        .withArgs(data);
    });

    it('should emit an event with the response', async () => {
      const data = '0xabc123';
      const txReq = asTx({
        to: asAddress(tester.address),
        data: asHex(tester.interface.encodeFunctionData('echo', [data])),
        nonce: nonce++,
      });

      await expect(execute(txReq))
        .to.emit(account, account.interface.events['OperationExecuted(bytes32,bytes)'].name)
        .withArgs(
          await hashTx(txReq, account),
          '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003abc1230000000000000000000000000000000000000000000000000000000000',
        );
    });
  });
});
