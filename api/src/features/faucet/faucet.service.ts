import { Injectable, OnModuleInit } from '@nestjs/common';
import { Address, ETH_ADDRESS, UAddress, asAddress, filterAsync } from 'lib';
import { NetworksService } from '~/features/util/networks/networks.service';
import { selectAccount } from '../accounts/accounts.util';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { parseUnits } from 'viem';
import { ERC20 } from 'lib/dapps';
import { BalancesService } from '~/features/util/balances/balances.service';

@Injectable()
export class FaucetService implements OnModuleInit {
  private tokens: { address: Address; amount: bigint }[] = [];

  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    private balances: BalancesService,
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
      address: asAddress(t.address),
      amount: parseUnits(t.address === ETH_ADDRESS ? '0.01' : '1', t.decimals),
    }));
  }

  async requestableTokens(account: UAddress): Promise<Address[]> {
    return (await this.getTokensToSend(account)).map((token) => token.address);
  }

  async requestTokens(account: UAddress): Promise<Address[]> {
    const tokensToSend = await this.getTokensToSend(account);
    const network = this.networks.for(account);

    for (const token of tokensToSend) {
      await network.useWallet(async (wallet) =>
        token.address === ETH_ADDRESS
          ? wallet.sendTransaction({
              to: asAddress(account),
              value: token.amount,
            })
          : wallet.writeContract({
              address: token.address,
              abi: ERC20,
              functionName: 'transfer',
              args: [asAddress(account), token.amount],
            }),
      );
    }

    return tokensToSend.map((t) => t.address);
  }

  private async getTokensToSend(account: UAddress) {
    if (!(await this.db.query(selectAccount(account)))) return [];

    const network = this.networks.for(account);
    if (!network.chain.testnet) return [];

    return filterAsync(this.tokens, async (token) => {
      const [recipientBalance, faucetBalance] = await Promise.all([
        this.balances.balance({ account, token: token.address }),
        this.balances.balance({ account: network.walletAddress, token: token.address }),
      ]);

      return recipientBalance < token.amount && faucetBalance > token.amount;
    });
  }
}
