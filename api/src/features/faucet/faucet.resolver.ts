import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProviderService } from '~/provider/provider.service';
import * as zk from 'zksync-web3';
import { parseEther } from 'ethers/lib/utils';
import { RequestFundsArgs } from './faucet.args';

const AMOUNT = parseEther('0.001');

@Resolver()
export class FaucetResolver {
  constructor(private provider: ProviderService) {}

  @Mutation(() => Boolean)
  async requestFunds(
    @Args() { recipient }: RequestFundsArgs,
  ): Promise<boolean> {
    if (!this.provider.chain.isTestnet)
      throw new Error('Only available on testnets');

    const balance = await this.provider.getBalance(recipient);
    if (balance.gte(AMOUNT)) return false;

    const txResp = await this.provider.wallet.transfer({
      to: recipient,
      token: zk.utils.ETH_ADDRESS,
      amount: AMOUNT,
    });
    await txResp.wait();

    console.log(txResp.hash);

    return true;
  }
}
