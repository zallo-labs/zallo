import { expect } from 'chai';
import { hashTx, asAddress, asTx, Address, ACCOUNT_ABI } from 'lib';
import { deploy, deployProxy, DeployProxyData, wallets, wallet } from './util';
import { encodeFunctionData, parseEther } from 'viem';
import { abi as testUtilAbi } from './contracts/TestUtil';

describe('Execution', () => {
  let { account, execute } = {} as DeployProxyData;
  let tester: Address;
  let nonce = 0n;

  before(async () => {
    ({ account, execute } = await deployProxy({
      extraBalance: parseEther('0.0001'),
    }));
    tester = (await deploy('TestUtil')).address;
  });

  describe('operation', () => {
    it('should send the specified value', async () => {
      const to = wallets[3].address;
      const value = parseEther('0.00001');

      await expect(execute({ to, value, nonce: nonce++ })).to.changeBalance(to, value);
    });

    it('should call with the specified data', async () => {
      const data = '0xabc123';
      await expect(
        execute({
          to: asAddress(tester),
          data: encodeFunctionData({
            abi: testUtilAbi,
            functionName: 'echo',
            args: [data],
          }),
          nonce: nonce++,
        }),
      ).to.includeEvent({ abi: testUtilAbi, eventName: 'Echo' });
    });

    it('should emit an event with the response', async () => {
      const txReq = asTx({
        to: tester,
        data: encodeFunctionData({
          abi: testUtilAbi,
          functionName: 'echo',
          args: ['0xabc123'],
        }),
        nonce: nonce++,
      });

      await expect(execute(txReq)).to.includeEvent({
        abi: ACCOUNT_ABI,
        eventName: 'OperationExecuted',
        args: {
          proposal: hashTx(account, txReq),
          response:
            '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003abc1230000000000000000000000000000000000000000000000000000000000',
        },
      });
    });

    it('should revert if the transaction has already been executed', async () => {
      const tx = asTx({ to: wallet.account.address, nonce: nonce++ });
      await execute(tx);

      await expect(execute(tx)).to.be.rejected;
    });

    it('should revert if the transaction reverts without a message', async () => {
      await expect(
        execute({
          to: tester,
          data: encodeFunctionData({
            abi: testUtilAbi,
            functionName: 'revertWithoutReason',
          }),
          nonce: nonce++,
        }),
      ).to.revert;
    });

    it('should revert with the message if the transaction reverts with a message', async () => {
      await expect(
        execute({
          to: tester,
          data: encodeFunctionData({
            abi: testUtilAbi,
            functionName: 'revertWithReason',
          }),
          nonce: nonce++,
        }),
      ).to.revert;
    });
  });
});
