import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { toTx, hashTx, TestUtil, asAddress, TestUtil__factory, ZERO } from 'lib';
import { deploy, deployProxy, DeployProxyData, WALLET, WALLETS } from './util';

describe('Execution', () => {
  let { account, execute } = {} as DeployProxyData;
  let tester = {} as TestUtil;

  let nonce: BigNumber = ZERO;
  const nonceAndInc = () => {
    const n = nonce;
    nonce = nonce.add(1);
    return n;
  };

  before(async () => {
    ({ account, execute } = await deployProxy({
      extraBalance: parseEther('0.0001'),
      nApprovers: 0,
    }));
    tester = TestUtil__factory.connect((await deploy('TestUtil')).address, WALLET);
  });

  it('should send the specified value', async () => {
    const to = WALLETS[WALLETS.length - 1];
    const value = parseEther('0.00001');

    await expect(execute({ to: to.address, value, nonce: nonceAndInc() })).to.changeEtherBalance(
      to,
      value,
    );
  });

  it('should call with the specified data', async () => {
    const data = '0xabc123';
    await expect(
      execute({
        to: asAddress(tester.address),
        data: tester.interface.encodeFunctionData('echo', [data]),
        nonce: nonceAndInc(),
      }),
    )
      .to.emit(tester, tester.interface.events['Echo(bytes)'].name)
      .withArgs(data);
  });

  it('should emit an event with the response', async () => {
    const data = '0xabc123';
    const txReq = toTx({
      to: asAddress(tester.address),
      data: tester.interface.encodeFunctionData('echo', [data]),
      nonce: nonceAndInc(),
    });

    await expect(execute(txReq))
      .to.emit(account, account.interface.events['TransactionExecuted(bytes32,bytes)'].name)
      .withArgs(
        await hashTx(txReq, account),
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003abc1230000000000000000000000000000000000000000000000000000000000',
      );
  });

  it('should revert if the transaction has already been executed', async () => {
    const tx = toTx({ to: WALLET.address, nonce: nonceAndInc() });
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
          data: tester.interface.encodeFunctionData('revertWithoutReason'),
          nonce: nonceAndInc(),
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
          to: asAddress(tester.address),
          data: tester.interface.encodeFunctionData('revertWithReason'),
          nonce: nonceAndInc(),
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
