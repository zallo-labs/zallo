import { Address } from 'lib';
import { deploy, network, testNetwork, wallet, wallets } from './util';
import PaymasterManager, { abi } from './contracts/PaymasterManager';
import TestToken from './contracts/TestToken';
import { ETH } from 'lib/dapps';
import { expect } from 'chai';
import { parseEther } from 'viem';

describe('PaymasterManager', () => {
  const eth = ETH.address[network.chain.key];
  let address: Address;
  let token: Address;

  before(async () => {
    address = (await deploy(PaymasterManager, [wallet.account.address])).address;
    token = (await deploy(TestToken, [])).address;
  });

  describe('withdraw', () => {
    it('only callable by owner', async () => {
      await expect(
        network.simulateContract({
          address,
          abi,
          functionName: 'withdraw',
          args: [eth, 0n],
          account: wallets[2].address,
        }),
      ).to.revertWith({ abi, errorName: 'OwnableUnauthorizedAccount' });
    });

    it('transfers ETH', async () => {
      await testNetwork.setBalance({ address, value: parseEther('1') });

      const amount = 5n;
      await expect(
        wallet.writeContract({
          address,
          abi,
          functionName: 'withdraw',
          args: [eth, amount],
        }),
      ).to.changeBalance(wallet.account.address, eth, amount);
    });

    it('transfers ERC20 token', async () => {
      const amount = 6n;
      await wallet.writeContract({
        address: token,
        abi: TestToken.abi,
        functionName: 'testMint',
        args: [address, amount],
      });

      await expect(
        wallet.writeContract({
          address,
          abi,
          functionName: 'withdraw',
          args: [token, amount],
        }),
      ).to.changeBalance(wallet.account.address, token, amount);
    });
  });
});
