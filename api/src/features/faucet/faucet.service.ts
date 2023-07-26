import { Injectable, OnModuleInit } from '@nestjs/common';
import { Address, filterAsync } from 'lib';
import { ProviderService } from '~/features/util/provider/provider.service';
import { selectAccount } from '../accounts/accounts.util';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { parseUnits } from 'viem';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

@Injectable()
export class FaucetService implements OnModuleInit {
  private tokens: { address: Address; amount: bigint }[] = [];

  constructor(private provider: ProviderService, private db: DatabaseService) {}

  async onModuleInit() {
    const tokens = await this.db.query(
      e.select(e.Token, (t) => ({
        filter: e.op('not', e.op('exists', t.user)),
        address: true,
        decimals: true,
      })),
    );

    this.tokens = tokens.map((t) => ({
      address: t.address as Address,
      amount: parseUnits(t.address === ETH_ADDRESS ? '0.1' : '1', t.decimals),
    }));
  }

  async requestableTokens(account: Address): Promise<Address[]> {
    return (await this.getTokensToSend(account)).map((token) => token.address);
  }

  async requestTokens(account: Address): Promise<Address[]> {
    const tokensToSend = await this.getTokensToSend(account);

    return (
      await filterAsync(
        tokensToSend,
        async (token) => !!(await this.transfer(account, token.address, token.amount)),
      )
    ).map((token) => token.address);
  }

  private async getTokensToSend(account: Address) {
    if (!(await this.db.query(selectAccount(account)))) return [];

    return filterAsync(this.tokens, async (token) => {
      const recipientBalance = await this.provider.getBalance(account, undefined, token.address);
      if (recipientBalance.gte(token.amount)) return false;

      const walletBalance = await this.provider.getBalance(
        this.provider.walletAddress,
        undefined,
        token.address,
      );
      if (walletBalance.lt(token.amount)) return false;

      return true;
    });
  }

  private async transfer(to: Address, token: Address, amount: bigint) {
    return this.provider.useWallet(async (wallet) => {
      const tx = await wallet.transfer({ to, token, amount });

      return tx.wait();
    });
  }
}
