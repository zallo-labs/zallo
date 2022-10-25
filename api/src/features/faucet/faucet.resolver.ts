import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProviderService } from '~/provider/provider.service';
import { parseEther, parseUnits } from 'ethers/lib/utils';
import { RequestFundsArgs } from './faucet.args';
import { BigNumber } from 'ethers';
import { address, Address, filterAsync } from 'lib';
import * as zk from 'zksync-web3';
import { Mutex } from 'async-mutex';

const TRANSFER_MUTEX = new Mutex();

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
    try {
      const tx = await TRANSFER_MUTEX.runExclusive(() =>
        this.provider.wallet.transfer({
          to: recipient,
          token: token.addr,
          amount: token.amount,
        }),
      );

      await tx.wait();

      return tx;
    } catch {
      return undefined;
    }
  }
}
