import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { address, Address, filterAsync } from 'lib';
import * as zk from 'zksync-web3';
import { ProviderService } from '~/provider/provider.service';

interface TokenFaucet {
  addr: Address;
  amount: BigNumber;
}

const ETH: TokenFaucet = {
  addr: address(zk.utils.ETH_ADDRESS),
  amount: parseEther('0.01'),
};

const DAI: TokenFaucet = {
  addr: address('0x537200b9Dd13Adc66749d5D8f1De2556F7f428eC'),
  amount: parseUnits('1', 18),
};
const USDC: TokenFaucet = {
  addr: address('0xf9A9aFd74Dc8A5BD3745d6613b0E169B3eac4fcF'),
  amount: parseUnits('1', 6),
};
const LINK: TokenFaucet = {
  addr: address('0x440b4f63674b5Cc4B1FE3021ecA276C49518db27'),
  amount: parseUnits('1', 18),
};

@Injectable()
export class FaucetService {
  constructor(private provider: ProviderService) {}

  async requestTokens(recipient: Address): Promise<Address[]> {
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
