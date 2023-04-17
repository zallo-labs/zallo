import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { asAddress, Address, filterAsync } from 'lib';
import * as zk from 'zksync-web3';
import { ProviderService } from '~/features/util/provider/provider.service';
import { getUserCtx } from '~/request/ctx';

interface TokenFaucet {
  addr: Address;
  amount: BigNumber;
}

const ETH: TokenFaucet = {
  addr: asAddress(zk.utils.ETH_ADDRESS),
  amount: parseEther('0.01'),
};

const DAI: TokenFaucet = {
  addr: asAddress('0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b'),
  amount: parseUnits('1', 18),
};
const USDC: TokenFaucet = {
  addr: asAddress('0x0faF6df7054946141266420b43783387A78d82A9'),
  amount: parseUnits('1', 6),
};
const LINK: TokenFaucet = {
  addr: asAddress('0x40609141Db628BeEE3BfAB8034Fc2D8278D0Cc78'),
  amount: parseUnits('1', 18),
};

@Injectable()
export class FaucetService {
  constructor(private provider: ProviderService) {}

  async requestTokens(recipient: Address): Promise<Address[]> {
    if (!getUserCtx().accounts.has(recipient)) return [];

    const tokensToSend = await this.getTokensToSend(recipient);

    return (
      await filterAsync(tokensToSend, async (token) => !!(await this.transfer(recipient, token)))
    ).map((token) => token.addr);
  }

  async getTokensToSend(recipient: Address) {
    return filterAsync([ETH, DAI, USDC, LINK], async (token) => {
      const recipientBalance = await this.provider.getBalance(recipient, undefined, token.addr);
      if (recipientBalance.gte(token.amount)) return false;

      const walletBalance = await this.provider.getBalance(
        this.provider.walletAddress,
        undefined,
        token.addr,
      );
      if (walletBalance.lt(token.amount)) return false;

      return true;
    });
  }

  private async transfer(recipient: Address, token: TokenFaucet) {
    return this.provider.useWallet(async (wallet) => {
      const tx = await wallet.transfer({
        to: recipient,
        token: token.addr,
        amount: token.amount,
      });

      return tx.wait();
    });
  }
}
