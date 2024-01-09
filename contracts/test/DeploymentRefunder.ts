import {
  Address,
  ETH_ADDRESS,
  RefundDeploymentMessage,
  asUAddress,
  deploymentRefundTypedData,
} from 'lib';
import { deploy, network, testNetwork, wallet, wallets } from './util';
import TestDeploymentRefunder, { abi } from './contracts/TestDeploymentRefunder';
import { hashTypedData, parseEther } from 'viem';
import { expect } from 'chai';
import TestToken from './contracts/TestToken';

describe('DeploymentRefunder', () => {
  let address: Address;

  const message: RefundDeploymentMessage = {
    token: ETH_ADDRESS,
    maxAmount: 10n,
  };

  beforeEach(async () => {
    address = (await deploy(TestDeploymentRefunder, [])).address;

    await testNetwork.setBalance({ address, value: parseEther('1') });
    await wallet.writeContract({ abi, address, functionName: 'initializeDeployRefunder' });
    await wallet.writeContract({ abi, address, functionName: 'setValidSignature', args: [true] });
  });

  describe('refundDeployment', () => {
    it('refunds deployer (native)', async () => {
      const amount = 5n;
      await expect(
        wallet.writeContract({
          abi,
          address,
          functionName: 'refundDeployment',
          args: [message, '0x', amount],
        }),
      ).to.changeBalance(wallet.account.address, ETH_ADDRESS, amount);
    });

    it('refunds deployer (token)', async () => {
      const amount = 5n;
      const token = (await deploy(TestToken, [])).address;
      await wallet.writeContract({
        abi: TestToken.abi,
        address: token,
        functionName: 'testMint',
        args: [address, amount],
      });

      await expect(
        wallet.writeContract({
          abi,
          address,
          functionName: 'refundDeployment',
          args: [{ token, maxAmount: amount }, '0x', amount],
        }),
      ).to.changeBalance(wallet.account.address, token, amount);
    });

    it('revert if already refunded', async () => {
      await wallet.writeContract({
        abi,
        address,
        functionName: 'refundDeployment',
        args: [message, '0x', 1n],
      });
      await expect(
        network.simulateContract({
          account: wallet.account,
          abi,
          address,
          functionName: 'refundDeployment',
          args: [message, '0x', 1n],
        }),
      ).to.revertWith({ abi, errorName: 'AlreadyRefunded' });
    });

    it('revert if called by anyone other than the deployer', async () => {
      await expect(
        network.simulateContract({
          account: wallets[2],
          abi,
          address,
          functionName: 'refundDeployment',
          args: [message, '0x', 1n],
        }),
      ).to.revertWith({ abi, errorName: 'NotRecipient' });
    });

    it('revert if signature is invalid', async () => {
      await wallet.writeContract({
        abi,
        address,
        functionName: 'setValidSignature',
        args: [false],
      });

      await expect(
        network.simulateContract({
          account: wallet.account,
          abi,
          address,
          functionName: 'refundDeployment',
          args: [message, '0x', 1n],
        }),
      ).to.revertWith({ abi, errorName: 'InvalidSignature' });
    });

    it('revert if the amount is greater than the max amount', async () => {
      await expect(
        network.simulateContract({
          account: wallet.account,
          abi,
          address,
          functionName: 'refundDeployment',
          args: [message, '0x', message.maxAmount + 1n],
        }),
      ).to.revertWith({ abi, errorName: 'AboveMaxRefundAmount' });
    });
  });

  describe('hashRefund', () => {
    it('hash correctly', async () => {
      const hash = hashTypedData(
        deploymentRefundTypedData(asUAddress(address, network.chain.key), message),
      );
      expect(
        await network.readContract({ abi, address, functionName: 'hashRefund', args: [message] }),
      ).to.eq(hash);
    });
  });
});
