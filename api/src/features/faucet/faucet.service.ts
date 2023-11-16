import { Injectable, OnModuleInit } from '@nestjs/common';
import { Address, filterAsync } from 'lib';
import { NetworksService } from '~/features/util/networks/networks.service';
import { selectAccount } from '../accounts/accounts.util';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { parseUnits } from 'viem';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

@Injectable()
export class FaucetService implements OnModuleInit {
  private tokens: { address: Address; amount: bigint }[] = [];

  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
  ) {}

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
      amount: parseUnits(t.address === ETH_ADDRESS ? '0.01' : '1', t.decimals),
    }));
  }

  async requestableTokens(account: Address): Promise<Address[]> {
    return (await this.getTokensToSend(account)).map((token) => token.address);
  }

  async requestTokens(account: Address): Promise<Address[]> {
    const tokensToSend = await this.getTokensToSend(account);
    const network = this.networks.for(account);

    return (
      await filterAsync(tokensToSend, async (token) =>
        network.useWallet(async (wallet) => {
          const tx = await wallet.transfer({
            to: account,
            token: token.address,
            amount: token.amount,
          });

          return (await tx.wait()).status === 0;
        }),
      )
    ).map((token) => token.address);
  }

  private async getTokensToSend(account: Address) {
    if (!(await this.db.query(selectAccount(account)))) return [];

    const network = this.networks.for(account);
    if (!network.chain.testnet) return [];

    return filterAsync(this.tokens, async (token) => {
      const [recipientBalance, faucetBalance] = await Promise.all([
        network.balance({ account, token: token.address }),
        network.balance({ account: network.walletAddress, token: token.address }),
      ]);

      return recipientBalance < token.amount && faucetBalance > token.amount;
    });
  }
}
