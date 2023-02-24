import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { toTx, hashTx, Tester } from 'lib';
import { deployProxy, DeployProxyData, deployTester, SIGNERS } from './util';

describe('Execution', () => {
  let { account, execute } = {} as DeployProxyData;
  let tester = {} as Tester;
  before(async () => {
    ({ account, execute } = await deployProxy({ extraBalance: parseEther('0.0001') }));
    tester = await deployTester();
  });

  it('should send the specified value', async () => {
    const to = SIGNERS[SIGNERS.length - 1];
    const value = parseEther('0.00001');

    await expect(execute({ to: to.address, value })).to.changeEtherBalance(to, value);
  });

  it('should call with the specified data', async () => {
    const data = '0xabc123';
    await expect(
      execute({
        to: tester.address,
        data: tester.interface.encodeFunctionData('echo', [data]),
      }),
    )
      .to.emit(tester, tester.interface.events['Echo(bytes)'].name)
      .withArgs(data);
  });

  it('should emit an event with the response', async () => {
    const data = '0xabc123';
    const txReq = toTx({
      to: tester.address,
      data: tester.interface.encodeFunctionData('echo', [data]),
    });

    await expect(execute(txReq))
      .to.emit(account, account.interface.events['TransactionExecuted(bytes32,bytes)'].name)
      .withArgs(
        await hashTx(txReq, account),
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003abc1230000000000000000000000000000000000000000000000000000000000',
      );
  });

  it('should revert if the transaction has already been executed', async () => {
    const txDef = toTx({ to: account.address });

    await (await execute(txDef)).wait();

    let threw = false;
    try {
      await (await execute(txDef)).wait();
    } catch (e) {
      // console.log(e instanceof Error && e.message);
      expect(e instanceof Error && e.message).to.contain(
        'Validation revert: Account validation error',
      );
      threw = true;
    }
    expect(threw).to.be.eq(true, 'Expected to throw');
  });

  it('should revert if the transaction reverts without a message', async () => {
    // AA transactions simply fail, ideally we would expect to:
    // - revertedWithCustomError(account, AccountError.ExecutionReverted);
    // - emit(account, account.interface.events['TxReverted(bytes32,bytes)'].name);

    let reverted = false;
    try {
      await (
        await execute({
          to: tester.address,
          data: tester.interface.encodeFunctionData('revertWithoutReason'),
        })
      ).wait();

      expect(true).to.emit(
        account,
        account.interface.events['TransactionReverted(bytes32,bytes)'].name,
      );
    } catch (e) {
      reverted = true;
    }
    expect(reverted).to.be.eq(true, 'Expected to revert');
  });

  it('should revert with the message if the transaction reverts with a message', async () => {
    // AA transactions simply fail, ideally we would expect to:
    // - revertedWithMessage(account, AccountError.ExecutionReverted);
    // - emit(account, account.interface.events['TxReverted(bytes32,bytes)'].name);

    let reverted = false;
    try {
      await (
        await execute({
          to: tester.address,
          data: tester.interface.encodeFunctionData('revertWithReason'),
        })
      ).wait();

      expect(true).to.emit(
        account,
        account.interface.events['TransactionReverted(bytes32,bytes)'].name,
      );
    } catch (e) {
      reverted = true;
    }
    expect(reverted).to.be.eq(true, 'Expected to revert');
  });
});
