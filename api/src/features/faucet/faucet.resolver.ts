import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProviderService } from '~/provider/provider.service';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { RequestFundsArgs } from './faucet.args';
import { BigNumber } from 'ethers';
import { address, Address, filterAsync } from 'lib';
import assert from 'assert';
import * as zk from 'zksync-web3';

interface TokenFaucet {
  addr: Address;
  amount: BigNumber;
}

const ETH: TokenFaucet = {
  addr: address(zk.utils.ETH_ADDRESS),
  amount: parseEther('0.01'),
};

const DAI: TokenFaucet = {
  addr: address('0x6B175474E89094C44Da98b954EedeAC495271d0F'),
  amount: parseUnits('1', 18),
};
const USDC: TokenFaucet = {
  addr: address('0x54a14D7559BAF2C8e8Fa504E019d32479739018c'),
  amount: parseUnits('1', 6),
};
const LINK: TokenFaucet = {
  addr: address('0x4732C03B2CF6eDe46500e799DE79a15Df44929eB'),
  amount: parseUnits('1', 18),
};

@Resolver()
export class FaucetResolver {
  constructor(private provider: ProviderService) {}

  @Query(() => Boolean)
  async canRequestFunds(
    @Args() { recipient }: RequestFundsArgs,
  ): Promise<boolean> {
    const tokensToSend = await this.getTokensToSend(recipient);
    return tokensToSend.length > 0;
  }

  @Mutation(() => Boolean)
  async requestFunds(
    @Args() { recipient }: RequestFundsArgs,
  ): Promise<boolean> {
    const tokensToSend = await this.getTokensToSend(recipient);

    const successes = await Promise.all(
      tokensToSend.map((token) => this.transfer(recipient, token)),
    );
    return successes.every((s) => s);
  }

  private async getTokensToSend(recipient: Address) {
    return filterAsync([ETH, DAI, USDC, LINK], async (token) => {
      const recipientBalance = await this.provider.getBalance(
        recipient,
        undefined,
        token.addr,
      );
      if (recipientBalance.gte(token.amount)) return false;

      const walletBalance = await this.provider.wallet.getBalance(token.addr);
      if (walletBalance.lt(token.amount)) return false;

      return true;
    });
  }

  private async transfer(recipient: Address, token: TokenFaucet) {
    assert(this.provider.chain.isTestnet);

    const recipientBalance = await this.provider.getBalance(
      recipient,
      undefined,
      token.addr,
    );
    if (recipientBalance.gte(token.amount)) return false;

    const walletBalance = await this.provider.wallet.getBalance(token.addr);
    if (walletBalance.lt(token.amount)) return false;

    const txResp = await this.provider.wallet.transfer({
      to: recipient,
      token: token.addr,
      amount: token.amount,
    });
    await txResp.wait();

    return true;
  }
}
